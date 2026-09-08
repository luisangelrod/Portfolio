"""Follow the Thread: synthetic invoice regression. Python 3, standard library only.

No AWS calls, authentication service, or private documents. The caller supplies
a trusted tenant context. The printed oracle is for tests/display only and is
never read by this validator. Confidence is not a guarantee of correctness.
"""
import json
import math
import re
import unittest


def is_integer(value):
    return type(value) is int or (type(value) is float and math.isfinite(value) and value.is_integer())


def evaluate(fixture, policy, context):
    def result(status, reason, total=None):
        return {'status': status, 'reason': reason, 'totalCents': total}

    document = fixture['document']
    if not context.get('trustedTenantId') or document['tenantId'] != context['trustedTenantId']:
        return result('denied', 'tenant_mismatch')
    threshold = policy['minimumConfidence']
    if policy['version'] not in ('schema-v1', 'evidence-v2') or not is_integer(threshold) or not 0 <= threshold <= 100:
        return result('invalid', 'invalid_policy')
    extraction, blocks = fixture['extraction'], fixture['blocks']
    amount = extraction['totalCents']
    invalid = not is_integer(amount) or not 0 <= amount <= 9007199254740991 or extraction['currency'] != 'USD'
    invalid = invalid or len({b['id'] for b in blocks}) != len(blocks)
    for block in blocks:
        box = block.get('box')
        if not isinstance(box, dict) or not all(k in box for k in ('left', 'top', 'width', 'height')):
            return result('invalid', 'invalid_input')
        invalid = invalid or not is_integer(block['confidence']) or not 0 <= block['confidence'] <= 100
        invalid = invalid or not is_integer(block['page']) or block['page'] < 1
        invalid = invalid or any(type(box[k]) not in (int, float) or not math.isfinite(box[k]) or not 0 <= box[k] <= 1 for k in ('left', 'top', 'width', 'height'))
        invalid = invalid or box['width'] <= 0 or box['height'] <= 0 or box['left'] + box['width'] > 1 or box['top'] + box['height'] > 1
    if invalid:
        return result('invalid', 'invalid_input')
    if policy['version'] == 'schema-v1':
        return result('accepted', 'schema_valid', amount)
    block = next((b for b in blocks if b['id'] == extraction['sourceRef']), None)
    if block is None:
        return result('review', 'missing_source', amount)
    if block['documentId'] != document['id'] or block['documentVersion'] != document['version'] or block['operationId'] != document['operationId']:
        return result('review', 'stale_source', amount)
    if not isinstance(block['text'], str) or not re.fullmatch(r'\$(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)\.[0-9]{2}', block['text']) or int(re.sub(r'[$,.]', '', block['text'])) != amount:
        return result('review', 'source_mismatch', amount)
    if block['confidence'] < threshold:
        return result('review', 'low_confidence', amount)
    return result('accepted', 'evidence_sufficient', amount)

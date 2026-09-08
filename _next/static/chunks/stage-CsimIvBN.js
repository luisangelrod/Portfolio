import{$t as e,Ar as t,D as n,Gr as r,Gt as i,Hr as a,I as o,J as s,K as c,Lr as l,Nr as u,Pr as d,Sr as f,Wt as p,_ as m,ai as h,cn as g,d as _,dn as v,ei as y,ir as b,l as x,m as S,nt as C,or as w,p as ee,rt as T,ti as E,tt as D,un as O,v as k,xr as A,yr as j,zr as M,zt as N}from"./three.core-TyV5lR1f.js";import{n as P,r as F,t as I}from"./OrbitControls-DdaPp_A3.js";import{t as L}from"./RoomEnvironment-DydePCId.js";var R={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},z=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},B=new g(-1,1,1,-1,0,1),te=new class extends _{constructor(){super(),this.setAttribute(`position`,new c([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new c([0,2,0,0,2,0],2))}},V=class{constructor(e){this._mesh=new p(te,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,B)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},H=class extends z{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof f?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=r.clone(e.uniforms),this.material=new f({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new V(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},U=class extends z{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},W=class extends z{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},G=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new y);this._width=n.width,this._height=n.height,t=new h(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:C}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new H(R),this.copyPass.material.blending=0,this.timer=new M}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}U!==void 0&&(r instanceof U?n=!0:r instanceof W&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new y);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},K=class extends z{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new m}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},q={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new m(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},J=class e extends z{constructor(e,t=1,n,a){super(),this.strength=t,this.radius=n,this.threshold=a,this.resolution=e===void 0?new y(256,256):new y(e.x,e.y),this.clearColor=new m(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let o=Math.round(this.resolution.x/2),s=Math.round(this.resolution.y/2);this.renderTargetBright=new h(o,s,{type:C}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new h(o,s,{type:C});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new h(o,s,{type:C});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),o=Math.round(o/2),s=Math.round(s/2)}let c=q;this.highPassUniforms=r.clone(c.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new f({uniforms:this.highPassUniforms,vertexShader:c.vertexShader,fragmentShader:c.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];o=Math.round(this.resolution.x/2),s=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new y(1/o,1/s),o=Math.round(o/2),s=Math.round(s/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new E(1,1,1),new E(1,1,1),new E(1,1,1),new E(1,1,1),new E(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=r.clone(R.uniforms),this.blendMaterial=new f({uniforms:this.copyUniforms,vertexShader:R.vertexShader,fragmentShader:R.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new m,this._oldClearAlpha=1,this._basic=new i,this._fsQuad=new V(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new y(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);return new f({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new y(.5,.5)},direction:{value:new y(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new f({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};J.BlurDirectionX=new y(1,0),J.BlurDirectionY=new y(0,1);var Y={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},X=class extends z{constructor(){super(),this.isOutputPass=!0,this.uniforms=r.clone(Y.uniforms),this.material=new b({name:Y.name,uniforms:this.uniforms,vertexShader:Y.vertexShader,fragmentShader:Y.fragmentShader}),this._fsQuad=new V(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},k.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};function Z(e){if(!e.object.userData.pickId)return!1;let t=e.object;for(;t;){if(!t.visible)return!1;t=t.parent}let n=e.object,r=Array.isArray(n.material)?n.material[e.face?.materialIndex??0]:n.material;if(!(r instanceof N)||!r.clippingPlanes?.length)return!0;let i=r.clippingPlanes.map(t=>t.distanceToPoint(e.point)<0);return!(r.clipIntersection?i.every(Boolean):i.some(Boolean))}var Q={cyan:4056302,amber:16757583,violet:9991935,red:16737402,lime:12381304,blue:4229595,pale:13819871},ne=(t,n=.2,r=.55,i=0)=>new e({color:t,metalness:n,roughness:r,emissive:t,emissiveIntensity:i});function re(e,t,n,r,i){let a=new p(new x(...t),r);return a.position.fromArray(n),a.castShadow=!0,a.receiveShadow=!0,i&&(a.userData.pickId=i),e.add(a),a}function ie(e,n,r,i,a){let o=new p(new t(n,20,12),i);return o.position.fromArray(r),o.castShadow=!0,a&&(o.userData.pickId=a),e.add(o),o}function ae(e,t,n,r){let i=new S(t.map(e=>new E().fromArray(e))),o=new p(new a(i,48,n,8,!1),r);return e.add(o),{mesh:o,curve:i}}function oe(e,t,r,i,a,o){let s=new E().fromArray(t),c=new E().fromArray(r),l=new p(new n(i,i,s.distanceTo(c),10),a);return l.position.copy(s).add(c).multiplyScalar(.5),l.quaternion.setFromUnitVectors(new E(0,1,0),c.sub(s).normalize()),l.castShadow=!0,o&&(l.userData.pickId=o),e.add(l),l}function se(e,t,n,r=`#bbccca`,i=1){let a=document.createElement(`canvas`);a.width=512,a.height=80;let o=a.getContext(`2d`);o.clearRect(0,0,512,80),o.font=`500 30px sans-serif`,o.fillStyle=r,o.textAlign=`center`,o.fillText(t,256,48);let s=new ee(a),c=new u(new d({map:s,transparent:!0,depthTest:!1}));return c.position.fromArray(n),c.scale.set(2.7*i,.42*i,1),e.add(c),c}function $(e){let t=new Set,n=new Set,r=new Set;e.traverse(e=>{let i=e;i.geometry&&t.add(i.geometry),i.material&&(Array.isArray(i.material)?i.material:[i.material]).forEach(e=>{n.add(e),Object.values(e).forEach(e=>{e instanceof l&&r.add(e)})})}),t.forEach(e=>e.dispose()),n.forEach(e=>e.dispose()),r.forEach(e=>e.dispose())}var ce=class{constructor(e,t){this.host=e,this.invalidateCallback=t,this.scene=new A,this.camera=new O(40,1,.03,400),this.root=new D,this.frame=0,this.dead=!1,this.ray=new w,this.down=null,this.onPick=null,this.onDrag=null,this.dragging=null,this.dragPlane=new v(new E(0,1,0),0),this.dragPoint=new E,this.pointerDown=e=>{this.down={x:e.clientX,y:e.clientY};let t=this.hit(e);t&&this.onDrag&&t.object.userData.draggable&&(this.dragging=t.object.userData.pickId,this.dragPlane.constant=-t.point.y,this.orbit.enabled=!1,this.renderer.domElement.setPointerCapture(e.pointerId))},this.pointerMove=e=>{this.dragging&&(this.hit(e),this.ray.ray.intersectPlane(this.dragPlane,this.dragPoint)&&this.onDrag?.(this.dragging,this.dragPoint.clone()))},this.pointerUp=e=>{if(this.dragging){this.cancel();return}if(this.down&&Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)<6){let t=this.hit(e);t&&this.onPick?.({id:t.object.userData.pickId,point:t.point.toArray()})}this.down=null},this.cancel=()=>{this.dragging=null,this.down=null,this.orbit.enabled=!0},this.contextLost=e=>{e.preventDefault(),this.invalidateCallback?.()},this.renderer=new F({antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)),this.renderer.outputColorSpace=j,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.85,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=2,this.renderer.domElement.setAttribute(`role`,`img`),this.renderer.domElement.setAttribute(`aria-label`,`Interactive laboratory apparatus. Labeled controls provide alternatives to direct manipulation.`),e.appendChild(this.renderer.domElement),this.scene.background=new m(1055778),this.scene.fog=new s(1055778,15,40),this.scene.add(this.root);let n=new P(this.renderer),r=new L;this.env=n.fromScene(r,.04),this.scene.environment=this.env.texture,this.scene.environmentIntensity=.35,r.dispose(),n.dispose();let i=new T(12050157,2568238,.8);this.scene.add(i);let a=new o(16771276,1.7);a.position.set(3,8,5),a.castShadow=!0,a.shadow.mapSize.set(1024,1024),a.shadow.camera.left=-9,a.shadow.camera.right=9,a.shadow.camera.top=9,a.shadow.camera.bottom=-9,a.shadow.bias=-.001,this.scene.add(a);let c=new o(6801663,.9);c.position.set(-5,3,-4),this.scene.add(c),this.orbit=new I(this.camera,this.renderer.domElement),this.orbit.enableDamping=!1,this.orbit.minDistance=3,this.orbit.maxDistance=24,this.orbit.maxPolarAngle=Math.PI*.49,this.orbit.addEventListener(`change`,()=>this.render()),this.composer=new G(this.renderer),this.composer.addPass(new K(this.scene,this.camera)),this.bloom=new J(new y(1,1),.2,.45,1.4),this.composer.addPass(this.bloom),this.composer.addPass(new X),this.observer=new ResizeObserver(()=>{let t=e.clientWidth,n=e.clientHeight;t&&n&&(this.renderer.setSize(t,n,!1),this.composer.setSize(t,n),this.camera.aspect=t/n,this.camera.updateProjectionMatrix(),this.render())}),this.observer.observe(e),this.renderer.domElement.addEventListener(`pointerdown`,this.pointerDown),this.renderer.domElement.addEventListener(`pointerup`,this.pointerUp),this.renderer.domElement.addEventListener(`pointermove`,this.pointerMove),this.renderer.domElement.addEventListener(`pointercancel`,this.cancel),this.renderer.domElement.addEventListener(`webglcontextlost`,this.contextLost),this.home()}hit(e){let t=this.renderer.domElement.getBoundingClientRect();return this.ray.setFromCamera(new y((e.clientX-t.left)/t.width*2-1,1-(e.clientY-t.top)/t.height*2),this.camera),this.ray.intersectObject(this.root,!0).find(Z)}home(){this.orbit.target.set(0,.9,0),this.camera.position.set(6,5,8),this.camera.lookAt(this.orbit.target),this.orbit.update(),this.render()}rotate(e){let t=this.camera.position.clone().sub(this.orbit.target).applyAxisAngle(new E(0,1,0),e);this.camera.position.copy(this.orbit.target).add(t),this.orbit.update(),this.render()}zoom(e){let t=this.camera.position.clone().sub(this.orbit.target).multiplyScalar(e).clampLength(3,24);this.camera.position.copy(this.orbit.target).add(t),this.orbit.update(),this.render()}render(){this.dead||document.hidden||this.frame||(this.frame=requestAnimationFrame(()=>{this.frame=0,!this.dead&&!document.hidden&&this.composer?.render()}))}async image(){return this.composer.render(),new Promise((e,t)=>this.renderer.domElement.toBlob(n=>n?e(n):t(Error(`Image capture failed.`))))}clear(){$(this.root),this.root.clear()}destroy(){this.dead=!0,cancelAnimationFrame(this.frame),this.observer.disconnect(),this.orbit.dispose(),this.renderer.domElement.removeEventListener(`pointerdown`,this.pointerDown),this.renderer.domElement.removeEventListener(`pointerup`,this.pointerUp),this.renderer.domElement.removeEventListener(`pointermove`,this.pointerMove),this.renderer.domElement.removeEventListener(`pointercancel`,this.cancel),this.renderer.domElement.removeEventListener(`webglcontextlost`,this.contextLost),$(this.scene),this.env.dispose(),this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};export{$ as a,ae as c,re as i,oe as l,ce as n,se as o,ie as r,ne as s,Q as t};
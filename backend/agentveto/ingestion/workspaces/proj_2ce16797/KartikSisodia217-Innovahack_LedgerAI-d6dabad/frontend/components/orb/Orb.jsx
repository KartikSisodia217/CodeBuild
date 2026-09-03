"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const vertexShader = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

void main() {

    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position; 

    float wave =
        sin(position.y * 6.0 + uTime * 1.4) * 0.009;

    wave +=
        sin(position.x * 7.0 - uTime * 1.2) * 0.007;

    wave +=
        sin(position.z * 5.5 + uTime * 1.0) * 0.006;

    pos += normal * wave;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x)
        + (c-a)*u.y*(1.0-u.x)
        + (d-b)*u.x*u.y;
}

float fbm(vec2 p){
    float value = 0.0;
    float amp = 0.5;

    for(int i=0;i<5;i++){
        value += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }

    return value;
}

void main(){

    vec2 uv = vUv;

    // Rotate UVs slightly to hide seam
    float angle = uTime * 0.03;

    mat2 rot = mat2(
        cos(angle), -sin(angle),
        sin(angle),  cos(angle)
    );

    uv = (rot * (uv - 0.5)) + 0.5;

    uv += 0.05 * vec2(
        fbm(uv * 3.0 + uTime * 0.15),
        fbm(uv * 3.0 - uTime * 0.20)
    );

    vec2 q = vec2(
        fbm(uv * 4.0 + uTime * 0.08),
        fbm(uv * 4.0 - uTime * 0.10)
    );

    vec2 r = vec2(
        fbm(uv * 4.0 + q + 1.7),
        fbm(uv * 4.0 + q + 8.3)
    );

    float n = fbm(
        uv * 6.0 +
        r * 1.1 +
        uTime * 0.15
    );
    vec3 deep = vec3(0.65, 0.60, 0.7);  // muted lavender shadow
    vec3 blue = vec3(0.62, 0.55, 0.85);  // soft purple-blue
    vec3 pink = vec3(0.85, 0.60, 0.78);  // dusty pink
    vec3 peach = vec3(0.90, 0.82, 0.65);  // warm cream

    vec3 color = mix(deep,blue,smoothstep(0.10,0.40,n));
    color = mix(color,pink,smoothstep(0.35,0.70,n));
    color = mix(color,peach,smoothstep(0.75,1.00,n));

    vec3 normal = normalize(vNormal);

    float fresnel = pow(1.0 - abs(normal.z),3.0);

    color += mix(
        vec3(0.25,0.10,0.80),
        vec3(0.80,0.55,1.00),
        n
    ) * fresnel * 0.9;

    color += fresnel * 0.08;

    color += 0.08 * sin(uTime * 2.0) * 0.15;

    gl_FragColor = vec4(color,1.0);
}
`;
export default function Orb() {

    const mesh = useRef();
    const material = useRef();

    useFrame(({ clock }) => {

        if (!mesh.current || !material.current) return;

        mesh.current.rotation.y =
            clock.elapsedTime * 0.02;

        mesh.current.position.y =
            Math.sin(clock.elapsedTime * 0.35) * 0.02;

        const scale =
            1 +
            Math.sin(clock.elapsedTime * 0.5)
            * 0.008;

        mesh.current.scale.set(
            scale,
            scale * 0.975,
            scale * 1.003
        );

        if (material.current?.uniforms?.uTime) {
            material.current.uniforms.uTime.value = clock.elapsedTime;
        }
    });

    return (
        <mesh ref={mesh}>
            <sphereGeometry
                args={[0.85, 256, 256]}
            />

            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uTime: { value: 0 }
                }}
            />
        </mesh>
    );
}
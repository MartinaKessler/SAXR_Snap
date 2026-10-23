import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

const token = import.meta.env.VITE_API_KEY;
const cameraKit = await bootstrapCameraKit({
  apiToken: token,
});

const liveRenderTarget = (await document.getElementById(
  "canvas"
)) as HTMLCanvasElement;
const session = await cameraKit.createSession({ liveRenderTarget });

let mediaStream = null;

try {
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
      aspectRatio: { exact: 0.56 },
    },
  });
} catch (err) {
  alert(
    "The lens can't be used because no camera is connected. Connect a camera, then reload the page."
  );
  throw err;
}

const source = createMediaStreamSource(mediaStream, {
  // transform: Transform2D.MirrorX,
  // cameraType: 'environment'
  cameraType: "user", // currently cube only displays with 'user'
});
await session.setSource(source);
await session.play();

const lens = await cameraKit.lensRepository.loadLens(
  import.meta.env.VITE_CUBE,
  import.meta.env.VITE_GROUP_ID
);
// const lens = await cameraKit.lensRepository.loadLens(import.meta.env.VITE_SAXR_IRIS, import.meta.env.VITE_GROUP_ID);
const pngForm = document.getElementById("png-form") as HTMLFormElement;
const pngInput = document.getElementById("png-url") as HTMLInputElement;

// Launch params are only read when the lens starts, so re-apply the lens with the new URL
async function applyPng(url: string) {
  await session.applyLens(lens, {
    launchParams: { url: url },
  });
}

// sample URLS:
// https://raw.githubusercontent.com/github/explore/main/topics/python/python.png works
// https://service.metason.net/ar/content/viz/irisLOD/lc.png doesn't work

// use curl -sI -H "Origin: http://localhost:5173" <URL> to see if access-control-allow- headers are present
// or see inside the browser under the Network tab, Headers

//The response headers showed Server: nginx/1.20.1, so the owner would add a rule to the nginx config, limited to the public content folder:
// location /ar/content/ {
//   add_header Access-Control-Allow-Origin * always;
// }
// - location /ar/content/ applies the header only to files under that path, not the whole server.
// - * means any origin. That's normal for public files like images and is how GitHub serves the Python PNG.
// - always sends the header on error responses too (404 etc.), so the browser shows the real error instead of a confusing CORS message.
// They then reload nginx (sudo nginx -s reload).

pngForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // without this, the browser would reload the page
  await applyPng(pngInput.value);
});

await applyPng(pngInput.value);
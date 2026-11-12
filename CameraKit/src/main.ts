import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

const token = import.meta.env.VITE_API_KEY;
const cameraKit = await bootstrapCameraKit({
  apiToken: token,
  logger: "console",
});

const liveRenderTarget = (await document.getElementById(
  "canvas"
)) as HTMLCanvasElement;
const session = await cameraKit.createSession({ liveRenderTarget });

// if a lens script throws, Camera Kit removes the lens silently
// show the error alert, because the console is hard to reach on the phone
// TODO: remove this for the production release
session.events.addEventListener("error", (event) => {
  const { error, lens } = event.detail;
  console.error("Lens error:", lens.name, error);
  alert("Lens error (${lens.name}): ${error.name}: ${error.message}");
});

let mediaStream = null;

try {
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
    },
  });
} catch (e) {
  alert(
    "The lens can't be used because no camera is connected. Connect a camera, then reload the page."
  );
  throw e;
}

const source = createMediaStreamSource(mediaStream, {
  cameraType: 'environment',
});
await session.setSource(source);
await session.play();

const lens = await cameraKit.lensRepository.loadLens(
  import.meta.env.VITE_SAXR_IRIS,
  import.meta.env.VITE_GROUP_ID
);
const jsonForm = document.getElementById("json-form") as HTMLFormElement;
const jsonInput = document.getElementById("json-url") as HTMLInputElement;

// Launch params are only read when the lens starts, so re-apply the lens with the new URL
async function applyJson(url: string) {
  await session.applyLens(lens, {
    launchParams: { url: url },
  });
}

jsonForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // without this, the browser would reload the page
  await applyJson(jsonInput.value);
});

await applyJson(jsonInput.value);
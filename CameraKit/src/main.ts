import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

async function getCamera(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
  } catch (e) {
    console.error("getUserMedia failed:", e);
    const name = e instanceof Error ? e.name : String(e);
    let hint = "The camera could not be started.";
    if (name === "NotAllowedError") {
      hint = "Allow camera access, then reload the page.";
    }
    else if (name === "NotFoundError") {
      hint = "No camera found. Connect one, then reload the page.";
    }
    else if (name === "NotReadableError") {
      hint = "The camera is in use by another app.";
    }
    alert(`${hint}\n(${name})`);
    return null;
  }
}

const jsonForm = document.getElementById("json-form") as HTMLFormElement;
const jsonInput = document.getElementById("json-url") as HTMLInputElement;

jsonForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // prevent the browser from reloading the page (default form behaviour)
  await applyJson(jsonInput.value);
});

let applyJson = async (url: string) => {
  // add this placeholder for applyJson because session & lens are not yet loaded
  console.warn(`Lens not ready yet, ignoring ${url}`);
};

const token = import.meta.env.VITE_API_KEY;
const cameraKit = await bootstrapCameraKit({
  apiToken: token,
  logger: "console",
});

const liveRenderTarget = document.getElementById("canvas") as HTMLCanvasElement;
const session = await cameraKit.createSession({ liveRenderTarget });

// TODO: remove this for the production release?
session.events.addEventListener("error", (event) => {
  const { error, lens } = event.detail;
  console.error("Lens error:", lens.name, error);
  alert(`Lens error (${lens.name}): ${error.name}: ${error.message}`);
});

const mediaStream = await getCamera();
if (!mediaStream) {
  throw new Error("No camera stream");
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

applyJson = async (url: string) => {
  await session.applyLens(lens, { launchParams: { url: url }, });
}

await applyJson(jsonInput.value);
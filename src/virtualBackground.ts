import { VirtualBackground } from "skyway-video-processors";


export const attachVBButton = (localResourcesArea: HTMLDivElement, localVideo: HTMLVideoElement) =>{
  const input = document.createElement("input")
  input.id = "attachVB"
  input.type = "file"
  input.accept = "image/jpeg,image/png"
  input.className="absolute invisible"
  
  const label = document.createElement("label")
  label.htmlFor = "attachVB"
  label.className = "cursor-pointer"

  const vbIcon = document.createElement("span")
  vbIcon.className = "material-symbols-outlined"
  vbIcon.textContent = "background_replace"
  label.appendChild(vbIcon)

  localResourcesArea.appendChild(input)
  localResourcesArea.appendChild(label)
  input.onchange = async () => {
    if(input.files === null) return
    const fileArray = Array.from(input.files)
    console.log(await fileArray[0].arrayBuffer())

    const reader = new FileReader()
    reader.onload = (e)=> typeof e.target?.result === 'string' && attachVB(localVideo, e.target.result)

    reader.readAsDataURL(fileArray[0])
  }

  return label
}

const attachVB = async (videoElement: HTMLVideoElement, imageUrl: string) => {
  const backgroundProcessor = new VirtualBackground({ image: imageUrl })

  await backgroundProcessor.initialize()

  const result = await backgroundProcessor.createProcessedStream()
  if (result.track === null)
    return


  const stream = new MediaStream([result.track])
  videoElement.srcObject = stream

  await videoElement.play()
}
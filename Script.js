let playlist = [];
let index = 0;
let loopPlaylist = true;
let audioUnlocked = false;

const player = document.getElementById("player");
const playlistPanel = document.getElementById("playlistPanel");
const unlockBtn = document.getElementById("unlockAudioBtn");
const videoFrame = document.getElementById("videoFrame");

let overlays = [];

function addVideos(){
  const files = document.getElementById("fileInput").files;
  if(!files.length) return;
  for(let f of files){
    const url = URL.createObjectURL(f);
    playlist.push({src:url, name:f.name});
  }
  document.getElementById("fileInput").value = "";
  playVideo(playlist.length-1);
}

function playVideo(i=index){
  if(playlist.length===0) return;
  index = i;
  player.src = playlist[index].src;
  player.play();
  renderPlaylist();
}

player.onended = () => {
  if(playlist.length===0) return;
  index = (index+1)%playlist.length;
  if(!loopPlaylist && index===0) return;
  playVideo();
};

function toggleLoop(){ 
  loopPlaylist = !loopPlaylist; 
  alert("Loop: "+(loopPlaylist?"ON":"OFF")); 
}

function renderPlaylist(){
  playlistPanel.innerHTML = "";
  if(playlist.length===0){
    playlistPanel.innerHTML = "Playlist is empty. Add videos below.";
    return;
  }
  playlist.forEach((v,i)=>{
    const div = document.createElement("div");
    div.className="playlist-item";
    div.draggable=true;
    div.innerHTML = `<span>${v.name}</span>
      <div>
        <button onclick=\"playVideo(${i})\">Play</button>
        <button onclick=\"playlist.splice(${i},1);renderPlaylist();\">Remove</button>
      </div>`;
    div.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", i));
    div.addEventListener("dragover", e => e.preventDefault());
    div.addEventListener("drop", e => {
      const startIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const endIndex = i;
      const temp = playlist[startIndex];
      playlist.splice(startIndex,1);
      playlist.splice(endIndex,0,temp);
      renderPlaylist();
    });
    playlistPanel.appendChild(div);
  });
}

function addOverlay(files){
  for(let f of files){
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.src = url;
    img.className="overlay-image";
    img.style.left = "10px";
    img.style.top = "10px";

    let offsetX, offsetY, dragging=false;
    img.addEventListener("mousedown", e=>{
      dragging=true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    });
    window.addEventListener("mousemove", e=>{
      if(!dragging) return;
      const rect = videoFrame.getBoundingClientRect();
      let x = e.clientX - rect.left - offsetX;
      let y = e.clientY - rect.top - offsetY;
      x = Math.max(0, Math.min(x, rect.width - img.width));
      y = Math.max(0, Math.min(y, rect.height - img.height));
      img.style.left = x+"px";
      img.style.top = y+"px";
    });
    window.addEventListener("mouseup", e=>{ dragging=false; });

    img.addEventListener("dblclick", ()=>{ img.remove(); overlays = overlays.filter(o=>o!==img); });

    overlays.push(img);
    videoFrame.appendChild(img);
  }
}

function unlockAudio(){
  if(audioUnlocked) return;
  player.muted = false;
  if(playlist.length>0) player.play();
  audioUnlocked = true;
  unlockBtn.style.display = "none";
}

window.onload = ()=>{ renderPlaylist(); }
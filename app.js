let myTopic, peerTopic, myName;


const setup = document.getElementById('setup');
const chat = document.getElementById('chat');
const messages = document.getElementById('messages');


enterBtn.onclick = () => {
myTopic = myTopic.value.trim();
peerTopic = peerTopic.value.trim();
myName = myName.value.trim();


if (!myTopic || !peerTopic || !myName) return;


setup.classList.add('hidden');
chat.classList.remove('hidden');


listen();
};


sendBtn.onclick = sendText;
msgInput.onkeydown = e => e.key === 'Enter' && sendText();
imgBtn.onclick = () => imgInput.click();
imgInput.onchange = sendImage;


function sendText() {
const text = msgInput.value.trim();
if (!text) return;


sendPayload({ kind: 'text', text });
msgInput.value = '';
}


async function sendImage() {
const file = imgInput.files[0];
if (!file) return;


const compressed = await compressImage(file);
const url = await uploadToCatbox(compressed);


sendPayload({ kind: 'image', url });
}


function sendPayload(data) {
const payload = { ...data, from: myName, ts: Date.now() };


fetch(`https://ntfy.sh/${myTopic}`, {
method: 'POST',
body: JSON.stringify(payload)
});


render(payload, true);
}


function listen() {
const es = new EventSource(`https://ntfy.sh/${peerTopic}/sse`);
es.onmessage = e => {
const msg = JSON.parse(e.data);
render(msg, false);
};
};

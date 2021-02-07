import Chance from 'chance';
import {toast} from 'react-toastify';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import assign from 'lodash/assign';
import {createStore, stores} from 'yaver';

const chance = new Chance();

createStore('main', {
  me: {
    id: null,
    x: 0,
    y: 0,
    z: 0,
    name: localStorage.getItem('name') || chance.name(),
  },
  users: []
});

const store = stores.get('main');
window.store = store;

let socket = null;
let myPeer = null;
let myStream = null;


const initUserStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    myStream = stream;
    return stream;
  });
}

const getUserStream = async () => {
  if (!myStream) return initUserStream();
  return myStream;
}

const getPeerJS = () => {
  return myPeer;
}

const getUser = async (id) => {
  return find(store.users, {id});
}

const updateUser = (id, state) => {
  const newUsers = cloneDeep(store.users);
  const user = find(newUsers, {id});
  if (!user) throw new Error(`User ${id} not in the store`);
  assign(user, state);
  stores.update('main', {...store, users: newUsers});
}



const updateMe = (state) => {
  stores.update('main', {...store, me: {...store.me, ...state}});
  if (socket)
    socket.emit('update', store.me);
}


const connect = ({host, port, roomId}) => {
  socket = io('/');

  socket.on('connect', () => {
    console.log(`Connected!`);
    console.log(`SocketID=${socket.id}`);

    setMicEnabled(store.me.micEnabled);
    setVideoEnabled(store.me.videoEnabled);
  });


  socket.on('room-updated', room => {
    stores.update('main', {users: room.users.map(user => {
      const existing = store.users.find(user => user.id === user.id);
      return {
        ...existing,
        ...user
      }
    })});
  });

  socket.on('user-connected', payload => {
    toast(`${payload.name || payload.id} connected`);
    console.log('User connected', payload);
  });

  socket.on('user-disconnected', payload => {
    toast(`${payload.name || payload.id} disconnected`);
    console.log('User disconnected', payload);
  });

  myPeer = new Peer({
    config: {
      iceServers: [
        {url:'stun:stun01.sipphone.com'},
        {url:'stun:stun.ekiga.net'},
        {url:'stun:stun.fwdnet.net'},
        {url:'stun:stun.ideasip.com'},
        {url:'stun:stun.iptel.org'},
        {url:'stun:stun.rixtelecom.se'},
        {url:'stun:stun.schlund.de'},
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
        {url:'stun:stunserver.org'},
        {url:'stun:stun.softjoys.com'},
        {url:'stun:stun.voiparound.com'},
        {url:'stun:stun.voipbuster.com'},
        {url:'stun:stun.voipstunt.com'},
        {url:'stun:stun.voxgratia.org'},
        {url:'stun:stun.xten.com'},
        {'url': 'turn:numb.viagenie.ca', 'credential': '7kSQDryCsV3M3VLq', 'username': 'mertdogar@gmail.com'},
      ]
    }
  });
  myPeer.on('open', id => {
    stores.update('main', {
      me: {
        ...store.me,
        id
      }
    });
    socket.emit('join-room', roomId, store.me);

    myPeer.on('call', async (call) => {
      console.log(`@@ Receive call from ${call.peer}`);
      call.answer(await getUserStream());

      call.on('stream', remoteUserStream => {
        console.log(`Received stream from ${call.peer}`);
      })
    })

    myPeer.on('error', async (error) => {
      console.error(`WebRTC Errror`, error);
    })
  });
};

const setMicEnabled = (value) => {
  updateMe({micEnabled: value});
  myStream.getAudioTracks()[0].enabled = value;
};

const setVideoEnabled = (value) => {
  updateMe({videoEnabled: value});
  myStream.getVideoTracks()[0].enabled = value;
};

export const Action = {initUserStream, getUserStream, connect, updateMe, updateUser, getPeerJS, setMicEnabled, setVideoEnabled};

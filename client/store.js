import Chance from 'chance';
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
    name: localStorage.getItem('name') || chance.name()
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
  socket.emit('update', store.me);
}


const connect = ({host, port, roomId}) => {
  socket = io('/');

  socket.on('connect', () => {
    console.log(`Connected!`);
    console.log(`SocketID=${socket.id}`);
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
    console.log('User connected', payload);
  });

  socket.on('user-disconnected', payload => {
    console.log('User disconnected', payload);
  });

  myPeer = new Peer();
  myPeer.on('open', id => {
    stores.update('main', {me: {id, x: 0, y: 0, z: 0, micEnabled: true, videoEnabled: true}});
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

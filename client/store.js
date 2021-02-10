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
    videoEnabled: true,
    micEnabled: true
  },
  users: []
});

const store = stores.get('main');
window.store = store;

let socket = null;
let myPeer = null;
let myStream = null;

navigator.mediaDevices.ondevicechange = async (event) => {
  toast(`Media device changed`);
};

const initUserStream = (data) => {
  const constraints = {
    video: true,
    audio: true
  };

  if (data.videoDeviceId) constraints.video = {deviceId: data.videoDeviceId};
  if (data.audioDeviceId) constraints.audios = {deviceId: data.audioDeviceId};

  return navigator.mediaDevices.getUserMedia(constraints).then(stream => {
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
    socket.emit('user.update', store.me);
}

const updateWidget = (widget) => {
  const newWidgets = cloneDeep(store.widgets);
  const widget_ = find(newWidgets, {id: widget.id});
  assign(widget_, widget)

  stores.update('main', {...store, widgets: newWidgets});
  if (socket)
    socket.emit('widget.update', widget_);
}


const connect = ({host, port, spaceId}) => {
  socket = io('/');

  socket.on('connect', () => {
    console.log(`Connected!`);
    console.log(`SocketID=${socket.id}`);

    setMicEnabled(store.me.micEnabled);
    setVideoEnabled(store.me.videoEnabled);
  });


  socket.on('space.updated', room => {
    // console.log(room);

    const mergedUsers = room.users.map(user => {
      const existing = store.users.find(user => user.id === user.id);
      return {
        ...existing,
        ...user
      }
    });

    stores.update('main', {users: mergedUsers, widgets: room.widgets});
  });

  socket.on('user.connected', payload => {
    toast(`${payload.name || payload.id} connected`);
    console.log('User connected', payload);
  });

  socket.on('user.disconnected', payload => {
    toast(`${payload.name || payload.id} disconnected`);
    console.log('User disconnected', payload);
  });

  myPeer = new Peer({
    config: {
      iceServers: [
        {"url": "stun:global.stun.twilio.com:3478?transport=udp", "urls": "stun:global.stun.twilio.com:3478?transport=udp"},
        {"url": "turn:global.turn.twilio.com:3478?transport=udp", "username": "d763ce30f4d36e59a5dc683252b625fafb3362d1290aa46d6be8519674c07533", "urls": "turn:global.turn.twilio.com:3478?transport=udp", "credential": "evt206ipjqfq3tA5S7C3XelweJGiFpU57+Zwdx4s71Q="},
        {"url": "turn:global.turn.twilio.com:3478?transport=tcp", "username": "d763ce30f4d36e59a5dc683252b625fafb3362d1290aa46d6be8519674c07533", "urls": "turn:global.turn.twilio.com:3478?transport=tcp", "credential": "evt206ipjqfq3tA5S7C3XelweJGiFpU57+Zwdx4s71Q="},
        {"url": "turn:global.turn.twilio.com:443?transport=tcp", "username": "d763ce30f4d36e59a5dc683252b625fafb3362d1290aa46d6be8519674c07533", "urls": "turn:global.turn.twilio.com:443?transport=tcp", "credential": "evt206ipjqfq3tA5S7C3XelweJGiFpU57+Zwdx4s71Q="}
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
    socket.emit('space.join', spaceId, store.me);

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

export const Action = {initUserStream, getUserStream, connect, updateMe, updateUser, getPeerJS, setMicEnabled, setVideoEnabled, updateWidget};

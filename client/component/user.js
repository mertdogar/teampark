import React, {useEffect, useRef, useCallback} from 'react';
import throttle from 'lodash/throttle';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import nameInitials from 'name-initials';
import {FiMicOff} from 'react-icons/fi';
import Draggable from 'react-draggable';
import classnames from 'classnames';
import {Action} from '../store';

const USER_WIDTH = 100;
const MUTE_DISTANCE = 400;

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    width: USER_WIDTH,
    height: USER_WIDTH,
    backgroundColor: 'white',
    borderRadius: '50%',
    boxSizing: 'border-box',
    border: '3px solid #555b7d',
    transition: 'all 0.2s',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  me: {
    transition: 'none',
    border: '3px solid #03a9f4'
  },
  stream: {
    display: 'flex',
    flex: 1,
    width: 96,
    height: 96,
    background: 'black',
  },
  button: {
    padding: 10,
    backgroundColor: '#e53935',
    margin: '0px 3px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: 'white',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  indicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    marginBottom: 10,
    fontWeight: '900'
  }
})

const updateMe = throttle(Action.updateMe, 100);


export default function({id, ...props}) {
  const classes = useStyles();
  const videoRef = useRef(null);
  const [store, setStore] = useStore('main');

  const isMe = id === store.me.id;

  useEffect(async () => {
    if (isMe) {
      const myStream = await Action.getUserStream();
      videoRef.current.srcObject = myStream;
      videoRef.current.muted = true;
      videoRef.current.play();
    } else {
      const call = Action.getPeerJS().call(id, await Action.getUserStream());
      call.on('stream', remotePeerStream => {
        videoRef.current.srcObject = remotePeerStream;
        videoRef.current.play();
      });
      call.on('close', () => {
        console.log(`User call ended ${id}`);
      });
      call.on('error', error => {
        console.log(`User call error ${id}`, error);
      });
    }

    return () => {
      if (isMe) {

      } else {

      }
    };
  }, []);

  const onDragStart = useCallback((a) => {
    // console.log(a);
  });

  const onDrag = useCallback((a, b) => {
    updateMe({x: b.x, y: b.y});
  });

  const onDragEnd = useCallback((a) => {
    // console.log(a);
  });





  if (!isMe) {
    const user = store.users.find(item => item.id == id);
    if (!user) return null;

    const diff = Math.sqrt(Math.pow(Math.abs(user.x - store.me.x), 2) + Math.pow(Math.abs(user.y - store.me.y), 2));
    let scale = 1;

    if (diff > MUTE_DISTANCE)
      scale = 0.5;
    else
      scale = 0.5 * ((MUTE_DISTANCE - diff) / MUTE_DISTANCE) + 0.5;

    if (videoRef.current) {
      if (diff > MUTE_DISTANCE)
        videoRef.current.volume = 0;
      else
        videoRef.current.volume = (MUTE_DISTANCE - diff) / MUTE_DISTANCE;
    }

    return (
      <div style={{transform: `translate3d(${user.x}px, ${user.y}px, ${user.z}px) scale(${scale})`}} className={classnames(classes.root, {[classes.me]: isMe})}>
        <video playsInline className={classes.stream} ref={videoRef} autoPlay={true}/>
        <div className={classes.indicators}>
          {
            !user.videoEnabled &&
            <div className={classes.initials}>{nameInitials(user.name || '')}</div>
          }
          {
            !user.micEnabled &&
            <div className={classes.button}><FiMicOff/></div>
          }
        </div>

      </div>
    );
  }

  return (
    <Draggable
      defaultPosition={{x: 0, y: 0}}
      position={null}
      scale={1}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragEnd}>
      <div className={classnames(classes.root, {[classes.me]: isMe})}>
        <video playsInline className={classes.stream} ref={videoRef} autoPlay={true}/>
        <div className={classes.indicators}>
          {
            !store.me.videoEnabled &&
            <div className={classes.initials}>{nameInitials(store.me.name || '')}</div>
          }
        </div>
      </div>
    </Draggable>
  );
};
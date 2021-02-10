import React, {useEffect, useRef, useCallback, useState} from 'react';
import throttle from 'lodash/throttle';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import nameInitials from 'name-initials';
import {FiMicOff} from 'react-icons/fi';
import Draggable from 'react-draggable';
import classnames from 'classnames';
import * as utils from '../lib/utils';
import {Action} from '../store';

const USER_WIDTH = 100;

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    width: USER_WIDTH,
    height: USER_WIDTH,
    cursor: 'pointer',
    userSelect: 'none'
  },
  circle: {
    display: 'flex',
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '50%',
    boxSizing: 'border-box',
    border: '3px solid #555b7d',
    transition: 'all 0.2s',
    overflow: 'hidden',
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
    objectFit: 'cover'
  },
  muteIndicator: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e53935',
    margin: '0px 3px',
    color: 'white',
    borderRadius: '50%',
    cursor: 'pointer',
    position: 'absolute',
    top: 65,
    left: 65
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
    fontWeight: '900'
  }
})

const updateMe = throttle(Action.updateMe, 100);


export default function({id, ...props}) {
  const classes = useStyles();
  const videoRef = useRef(null);
  const [store, setStore] = useStore('main');
  const [call_, setCall_] = useState();

  const isMe = id === store.me.id;

  const callUser = async () => {
    console.log(`Calling ${id}`);
    const call = Action.getPeerJS().call(id, await Action.getUserStream());
    setCall_(call);
    call.on('stream', remotePeerStream => {
      videoRef.current.srcObject = remotePeerStream;
      videoRef.current.play();
    });
    call.on('close', () => {
      console.log(`User call ended ${id}`);
    });
    call.on('error', error => {
      console.log(`User call error ${id}`, error);
      setCall_(null);
      console.log(`Recalling ${id}`);
      callUser();
    });
  }

  useEffect(async () => {
    if (isMe) {
      const myStream = await Action.getUserStream();
      videoRef.current.srcObject = myStream;
      videoRef.current.muted = true;
      videoRef.current.play();
    } else {
      callUser();
    }

    return () => {
      if (isMe) {

      } else {
        setCall_(null);
        call.close();
      }
    };
  }, []);

  const onDragStart = useCallback((event) => {
    // console.log(a);
    event.preventDefault();
    event.stopPropagation();
  });

  const onDrag = useCallback((event, b) => {
    event.preventDefault();
    event.stopPropagation();
    updateMe({x: b.x, y: b.y});


  });

  const onDragEnd = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  if (!isMe) {
    const user = store.users.find(item => item.id == id);
    if (!user) return null;

    const scale = utils.getScaleByPositions(user, store.me);
    const volume = utils.getVolumeByPositions(user, store.me);
    if (videoRef.current) videoRef.current.volume = volume;

    return (
      <div
        style={{transform: `translate3d(${user.x}px, ${user.y}px, ${user.z}px) scale(${scale})`}}
        className={classnames(classes.root)}>
        <div className={classnames(classes.circle, {[classes.me]: isMe})}>
          <video playsInline className={classes.stream} ref={videoRef} autoPlay={true}/>
          <div className={classes.indicators}>
            {
              !user.videoEnabled &&
              <div className={classes.initials}>{nameInitials(user.name || '')}</div>
            }
          </div>
        </div>
        {
          !user.micEnabled &&
          <div className={classes.muteIndicator}><FiMicOff/></div>
        }
      </div>

    );
  }

  return (
    <Draggable
      defaultPosition={{x: 0, y: 0}}
      position={null}
      scale={props.scale}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragEnd}>
      <div className={classnames(classes.root)} onTouchStart={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()}>
        <div className={classnames(classes.circle, {[classes.me]: isMe})}>
          <video playsInline className={classes.stream} ref={videoRef} autoPlay={true}/>
          {
            !store.me.videoEnabled &&
            <div className={classes.indicators}>
              <div className={classes.initials}>{nameInitials(store.me.name || '')}</div>
              </div>
          }
        </div>

      </div>
    </Draggable>
  );
};
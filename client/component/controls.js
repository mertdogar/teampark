import React, {useEffect, useCallback} from 'react';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import classnames from 'classnames';
import {FiMic,  FiMicOff, FiVideo, FiVideoOff} from 'react-icons/fi';
import {Action} from '../store';

const useStyles = createUseStyles({
  root: {
    left: '50%',
    bottom: 30,
    overflow: 'hidden',
    position: 'fixed',
    backgroundColor: '#5353535e',
    backdropFilter: 'blur(4px)',
    width: 320,
    marginLeft: -160,
    height: 50,
    borderRadius: '30px',
    boxShadow: '0px 0px 4px 0px #0000003d',
    border: '1px solid #607d8b45',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
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
  on: {
    backgroundColor: '#0277bd',
  }
})


export default function(props) {
  const classes = useStyles();
  const [store, setStore] = useStore('main');

  useEffect(() => {

  }, []);

  const toggleMic = useCallback(() => {
    if (store.me.micEnabled)
      Action.setMicEnabled(false);
    else
      Action.setMicEnabled(true);
  });

  const toggleVideo = useCallback(() => {
    if (store.me.videoEnabled)
      Action.setVideoEnabled(false);
    else
      Action.setVideoEnabled(true);
  });

  return <div className={classes.root}>
    <div className={classnames(classes.button, {[classes.on]: store.me.videoEnabled})} onClick={toggleVideo}>
      {store.me.videoEnabled && <FiVideo/>}
      {!store.me.videoEnabled && <FiVideoOff/>}
    </div>
    <div className={classnames(classes.button, {[classes.on]: store.me.micEnabled})} onClick={toggleMic}>
      {store.me.micEnabled && <FiMic/>}
      {!store.me.micEnabled && <FiMicOff/>}
    </div>
  </div>;
};
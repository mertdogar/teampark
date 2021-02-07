import React, {useEffect, useCallback, useState} from 'react';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import classnames from 'classnames';
import {FiMic,  FiMicOff, FiVideo, FiVideoOff} from 'react-icons/fi';
import {Action} from '../store';

const useStyles = createUseStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000ab'
  },
  dialog: {
    display: 'flex',
    overflow: 'hidden',
    backgroundColor: '#5353535e',
    backdropFilter: 'blur(4px)',
    width: 400,
    borderRadius: '30px',
    boxShadow: '0px 0px 4px 0px #0000003d',
    border: '1px solid #607d8b45',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 30,
    boxSizing: 'border-box',
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  name: {
    border: 0,
    outline: 'none',
    padding: '6px 8px',
    color: '#313030',
    borderRadius: '5px',
    textAlign: 'center'
  },
  submit: {
    color: 'white',
    cursor: 'pointer',
    margin: '0px 3px',
    display: 'flex',
    padding: '6px 22px',
    alignItems: 'center',
    borderRadius: '8px',
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    '&:hover': {
      backgroundColor: '#43a047'
    }
  },
  disabled: {
    filter: 'grayscale(1) !important',
    cursor: 'no-drop !important',
    backgroundColor: '#4caf50 !important',
    '&:hover': {
      backgroundColor: '#4caf50 !important'
    }
  },
})


export default function(props) {
  const classes = useStyles();

  const [store, setStore] = useStore('main');
  const [name, setName] = useState(store.me.name);

  useEffect(() => {

  }, []);

  const submit = useCallback(() => {
      Action.updateMe({name});
      localStorage.setItem('name', name)
      props.onSubmit();
  });

  const onNameChange = useCallback((event) => {
      setName(event.target.value);
  });

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

  return (
    <div className={classes.root}>
      <div className={classes.dialog}>
        <div style={{marginBottom: 20}} className={classes.controls}>
          <input value={name} onChange={onNameChange} type="text" className={classes.name}/>
        </div>
        <div style={{marginBottom: 20}} className={classes.controls}>
          <div className={classnames(classes.button, {[classes.on]: store.me.videoEnabled})} onClick={toggleVideo}>
            {store.me.videoEnabled && <FiVideo/>}
            {!store.me.videoEnabled && <FiVideoOff/>}
          </div>
          <div className={classnames(classes.button, {[classes.on]: store.me.micEnabled})} onClick={toggleMic}>
            {store.me.micEnabled && <FiMic/>}
            {!store.me.micEnabled && <FiMicOff/>}
          </div>
        </div>
        <div className={classes.controls}>
          <div onClick={submit} className={classnames(classes.submit, {[classes.disabled]: !name})}>Save</div>
        </div>
      </div>
    </div>
  );
};
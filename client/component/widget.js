import React, {useEffect, useRef, useCallback, useState} from 'react';
import throttle from 'lodash/throttle';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import ReactPlayer from 'react-player';
import * as utils from '../lib/utils';
import Draggable from 'react-draggable';
import classnames from 'classnames';
import {Action} from '../store';

const useStyles = createUseStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    position: 'absolute',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundSize: `100%`,
    backgroundRepeat: 'no-repeat'
  },
  handle: {
    color: 'white',
    backgroundColor: '#ff8a65',
    padding: 4,
    textAlign: 'center',
    fontSize: '0.8em',
  },
  body: {
    flex: 1
  }
})


export default function({id, ...props}) {
  const classes = useStyles();
  const [store, setStore] = useStore('main');

  const widget = store.widgets.find(item => item.id == id);

  const onDragEnd = useCallback((a, b) => {
    console.log('end');
    Action.updateWidget({
      ...widget,
      x: b.x,
      y: b.y
    })
  });

  const volume = utils.getVolumeByPositions(widget, store.me);

  return (
    <Draggable position={{x: widget.x, y: widget.y, z: widget.z}} onStop={onDragEnd} scale={1}>
      <div className={classnames(classes.root)}>
        <div className={classes.handle}>{widget.name}</div>
        <div className={classes.body} style={{width: widget.width, height: widget.height}}>
          {
            widget.type === 'player' &&
            <ReactPlayer volume={volume} playing={true} loop={true} playsinline={true} width={widget.width} height={widget.height} url={widget.data} />
          }
          {
            widget.type === 'iframe' &&
            <iframe frameborder="0" src={widget.data} />
          }
        </div>
      </div>
    </Draggable>
  );
};
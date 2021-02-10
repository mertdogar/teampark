import React, {useEffect, useRef, useState} from 'react';
import {MapInteraction} from 'react-map-interaction';
import map from 'lodash/map';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import User from './user';
import Widget from './widget';
import backImage from '../assets/back.jpg';

const spaceRect = {
  width: 1920,
  height: 1080
}

const useStyles = createUseStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    flex: 1,
    backgroundColor: 'black',
    overflow: 'hidden'
  },
  space: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: spaceRect.width,
    height: spaceRect.height,
    backgroundImage: `url(${backImage})`,
    transformOrigin: '0 0 ',
    cursor: 'pointer'
  }
})


export default function(props) {
  const classes = useStyles();
  const [store, setStore] = useStore('main');
  const [boundaries, setBoundaries] = useState({
    minScale: Number.MIN_SAFE_INTEGER,
    maxScale: Number.MAX_SAFE_INTEGER,
    translationBounds: {
      xMin: 0,
      xMax: Number.MAX_SAFE_INTEGER,
      yMin: 0,
      yMax: Number.MAX_SAFE_INTEGER
    }
  });

  const [scale_, setScale_] = useState(1);

  const spaceRoot = useRef();

  const updateBoundaries = () => {
    const spaceRootRect = spaceRoot.current.getBoundingClientRect();
    setBoundaries({
      minScale: Math.max(Math.abs(spaceRootRect.width / spaceRect.width), Math.abs(spaceRootRect.height / spaceRect.height)),
      maxScale: 2,
      translationBounds: {
        xMin: (spaceRootRect.width - spaceRect.width * scale_),
        xMax: 0,
        yMin: (spaceRootRect.height - spaceRect.height * scale_),
        yMax: 0
      }
    });
  }

  useEffect(() => {
    window.addEventListener('resize', updateBoundaries);

    return () => {
      window.removeEventListener('resize', updateBoundaries);
    }
  }, []);

  useEffect(updateBoundaries, [scale_]);

  return (
    <div className={classes.root} ref={spaceRoot}>
      <MapInteraction disableZoom={false} {...boundaries}>
        {
          ({translation, scale}) => {
            setScale_(scale);
            const transform = `translate(${translation.x}px, ${translation.y}px) scale(${scale})`;
            return (
              <div className={classes.space} style={{transform}}>
                {map(store.widgets, widget => <Widget key={widget.id} id={widget.id} transform={transform} scale={scale}/>)}
                {map(store.users, user => <User key={user.id} id={user.id} transform={transform} scale={scale}/>)}
              </div>
            )
        }}
      </MapInteraction>
    </div>
  );
};
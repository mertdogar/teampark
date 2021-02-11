import React, {useEffect, useRef} from 'react';
import {createUseStyles} from 'react-jss';


const useStyles = createUseStyles({
  root: {
    width: '100%',
    height: '100%'
  },
});

export default function({data, volume}) {
  const classes = useStyles();
  const audioRef = useRef();

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume])

  return (
    <div className={classes.root}>
      <img className={classes.root} src={data.image} />
      <audio ref={audioRef} volume={volume} loop={true} src={data.sound} autoPlay={true} />
    </div>
  );
};
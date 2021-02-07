import React, {useEffect} from 'react';
import map from 'lodash/map';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import User from './user';
import backImage from '../assets/back.jpg';

// import {Action} from '../store';

const useStyles = createUseStyles({
  root: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    flex: 1,
    backgroundColor: 'black',
    overflow: 'scroll'
  },
  room: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    backgroundImage: `url(${backImage})`,
  }
})


export default function(props) {
  const classes = useStyles();
  const [store, setStore] = useStore('main');

  useEffect(() => {

  }, []);

  return <div className={classes.root}>
    <div className={classes.room}>
      {map(store.users, user => <User key={user.id} id={user.id} />)}
    </div>
  </div>;
};
import React, {useEffect, useState} from 'react';
import {createUseStyles} from 'react-jss';
import {useStore} from 'yaver';
import {Action} from './store';
import Loby from './component/loby';
import Controls from './component/controls';
import Users from './component/users';
import Room from './component/room';



const useStyles = createUseStyles({
  root: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden'
  }
});

export default function(props) {
  const classes = useStyles();
  const [showLoby, setShowLoby] = useState(true);
  const [store, setStore] = useStore('main');


  useEffect(async () => {
    const {pathname, hostname, port} = new URL(location.href);

    await Action.initUserStream();

    await Action.connect({
      roomId: pathname.slice(1),
      host: hostname,
      port: parseInt(port)
    });
  }, []);


  return (
    <div className={classes.root}>
      <Room/>
      <Users/>
      {!showLoby && <Controls/>}
      {showLoby && <Loby onSubmit={() => setShowLoby(false)}/>}
    </div>
  );
};
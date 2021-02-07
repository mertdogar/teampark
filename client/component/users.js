import React, {useEffect} from 'react';
import map from 'lodash/map';
import {createUseStyles} from 'react-jss';
import classnames from 'classnames';
import {useStore} from 'yaver';

const useStyles = createUseStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    maxWidth: 200
  },
  user: {
    display: 'block',
    padding: '4px 11px',
    overflow: 'hidden',
    boxsizing: 'border-box',
    whiteSpace: 'nowrap',
    borderRadius: '8px',
    textOverflow: 'ellipsis',
    margin: '3px 3px',
    fontSize: '0.7em',
    fontWeight: '300',
    background: '#00000080',
    backdropDilter: 'blur(1px)',
    color: 'white',
  },
  me: {
    color: '#b3e5fc'
  }
})


export default function(props) {
  const classes = useStyles();
  const [store, setStore] = useStore('main');

  useEffect(() => {

  }, []);

  return <div className={classes.root}>
    {map(store.users, user => <div key={user.id} className={classnames(classes.user, {[classes.me]: user.id === store.me.id})}>{user.name}</div>)}
  </div>;
};
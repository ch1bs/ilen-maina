import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { FaBeer } from 'react-icons/fa';

firebase.initializeApp({
  apiKey: 'AIzaSyDvejHdww1PwBugC2pKoUoQn6zNWNxowO4',
  authDomain: 'ilen-maina.firebaseapp.com',
  databaseURL: 'https://ilen-maina.firebaseio.com',
  projectId: 'ilen-maina',
  storageBucket: 'ilen-maina.appspot.com',
  messagingSenderId: '585361708460',
  appId: '1:585361708460:web:c8f14e622aa52a744f1609',
  measurementId: 'G-H4PNMME15F',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <h1>ИЛЕНМАЙНА ЧАТ</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>
        Влез с Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        Излез
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder='пиши в Иленмайна...'
        />

        <button type='submit' disabled={!formValue}>
          <FaBeer />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            'data:image/jpeg;base64,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'
          }
          alt={displayName}
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;

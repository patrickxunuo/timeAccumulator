import './App.css';
import React, {useState, useEffect} from 'react'
import Popup from './components/Popup'
import firebase from "./Firebase";
import {motion} from 'framer-motion'
// import Firebase from "./Firebase";

const firebaseConfig = {
    apiKey: "AIzaSyDFdufe8a1esRNZxo55kDixOhuzpEg2rf0",
    authDomain: "timecounter-3e1ea.firebaseapp.com",
    projectId: "timecounter-3e1ea",
    storageBucket: "timecounter-3e1ea.appspot.com",
    messagingSenderId: "1043908992178",
    appId: "1:1043908992178:web:07ca67acb0ae1311177dab",
    measurementId: "G-X84QZVRERM"
};
// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore()
db.settings({timestampsInSnapshot: true})


function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function convertTimeColon(time) {
    let hh = Math.floor(time / 3600)
    let mm = Math.floor((time - hh * 3600) / 60)
    let ss = (time - hh * 3600 - mm * 60)
    if (hh.toString().length === 1) {
        hh = '0' + hh
    }
    if (mm.toString().length === 1) {
        mm = '0' + mm
    }
    if (ss.toString().length === 1) {
        ss = '0' + ss
    }
    return hh + ':' + mm + ':' + ss
}

function convertTimeHour(time) {
    let hh = Math.floor(time / 3600)
    let mm = Math.floor((time - hh * 3600) / 60)
    // let ss = (time - hh * 3600 - mm * 60)
    // return hh + ' hr ' + mm + ' min ' + ss + ' sec'
    return hh + ' hr ' + mm + ' min'
}

function App() {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [ending, setEnding] = useState(false)
    const [date, setDate] = useState(Date().slice(0, 15))
    const [ifHave, setIfHave] = useState(false)
    const [weekTime, setWeekTime] = useState(null)
    const [todayTime, setTodayTime] = useState(null)

    useEffect(() => {
        let weekTime = 0
        db.collection('DateTimes').where('weekNo', '==', getWeekNumber(new Date())).get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                weekTime += doc.data().second
            })
            setWeekTime(convertTimeHour(weekTime))
        })
        db.collection('DateTimes').where('date', '==', Date().slice(4, 15)).get().then((snapshot) => {
            if (snapshot.docs.length !== 0) {
                setIfHave(true)
                setTodayTime(convertTimeHour(snapshot.docs[0].data().second))
            } else {
                setIfHave(false)
                setTodayTime(0)
            }
        })
        if (isRunning) {
            const timer = setInterval(() => {
                setTime(time => time + 1)
            }, 1000)
            return () => window.clearInterval(timer)
        }
    }, [isRunning, weekTime, ifHave])

    const startRun = () => {
        setIsRunning(true)
    }

    const stopRun = () => {
        setIsRunning(false)
    }

    const startPop = () => {
        setEnding(true)
    }

    const endPop = () => {
        setEnding(false)
    }

    const submitTime = () => {
        setWeekTime(weekTime => weekTime + time)
        setTodayTime(todayTime => todayTime + time)
        if (ifHave) {
            db.collection('DateTimes').where('date', '==', Date().slice(4, 15)).get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    db.collection('DateTimes').doc(doc.id).update({
                        second: time + doc.data().second
                    })
                })
            })
        } else {
            db.collection('DateTimes').add({
                date: Date().slice(4, 15),
                weekNo: getWeekNumber(new Date()),
                second: time,
            })
        }
        setTime(0)
    }

    return (
        <div className="App">
            <div className="container">
                <div className="appname">Time Accumulator</div>
                <div className="date">{date}</div>
                <div className="timer">{convertTimeColon(time)}</div>
                {(!isRunning && !ending) &&
                <motion.button className="btn" id='btn-start' onClick={startRun}
                               whileHover={{
                                   scale: 1.02,
                               }}
                               whileTap={{
                                   backgroundColor: 'var(--button-text)',
                                   color: 'var(--button)',
                               }}
                               exit={{
                                   scale: 0
                               }}>
                    Start
                </motion.button>
                }
                {(isRunning || ending) &&
                <button className="btn" id='btn-stop' onClick={() => {
                    stopRun()
                    startPop()
                }}>
                    End
                </button>
                }
                <div className="week-timer">
                    Time contributed
                    <div>
                        this week: {weekTime}
                    </div>
                    <div>
                        today: {todayTime}
                    </div>
                </div>
                {
                    ending &&
                    <Popup startrun={startRun} stoprun={stopRun} startpop={startPop} endpop={endPop}
                           submittime={submitTime}/>
                }
            </div>
            {
                ending &&
                <div className="canvas"></div>
            }
        </div>
    );
}

export default App;

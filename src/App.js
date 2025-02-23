import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./style.css";

const firebaseConfig = {
    apiKey: "AIzaSyDNd3TAK_9xcQQhMbGO3v5iqzXVeOLfy1o",
    authDomain: "calynnder-22a48.firebaseapp.com",
    projectId: "calynnder-22a48",
    storageBucket: "calynnder-22a48.firebasestorage.app",
    messagingSenderId: "823028669501",
    appId: "1:823028669501:web:6be48306e38971012e5e54"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function App() {
    return (
        <Router>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/guest" element={<GuestView />} />
                    <Route path="/lynn" element={<LynnView />} />
                </Routes>
            </div>
        </Router>
    );
}

function LandingPage() {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Are you Lynn?</h1>
            <div className="mt-4">
                <Link to="/lynn" className="p-2 bg-blue-500 text-white rounded">Yes</Link>
                <Link to="/guest" className="ml-4 p-2 bg-gray-500 text-white rounded">Login as Guest</Link>
            </div>
        </div>
    );
}

function GuestView() {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            const querySnapshot = await getDocs(collection(db, "appointments"));
            setAppointments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchAppointments();
    }, []);

    const bookAppointment = async (time) => {
        if (!name || !subject) {
            alert("Please enter your name and subject.");
            return;
        }
        await addDoc(collection(db, "appointments"), { date: date.toDateString(), time, name, subject });
        alert(`Booked with ${name} for ${subject} on ${date.toDateString()} at ${time}`);
    };

    return (
        <div className="text-center">
            <h2 className="text-xl font-bold">Lynn’s Availability</h2>
            <Calendar onChange={setDate} value={date} className="mt-4 mx-auto" />
            <h3 className="mt-4">Available slots for {date.toDateString()}:</h3>
            <ul className="mt-2">
                {appointments.filter(slot => slot.date === date.toDateString()).map((slot) => (
                    <li key={slot.id} className="my-2">
                        {slot.time} - {slot.available ? (
                        <button className="bg-green-500 text-white p-1 rounded" onClick={() => bookAppointment(slot.time)}>Book</button>
                    ) : (
                        <span className="text-red-500">Unavailable</span>
                    )}
                    </li>
                ))}
            </ul>
            <div className="mt-4">
                <input type="text" placeholder="Your Name" className="border p-1" onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder="Subject" className="border p-1 ml-2" onChange={(e) => setSubject(e.target.value)} />
            </div>
        </div>
    );
}

function LynnView() {
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const fetchAppointments = async () => {
            const querySnapshot = await getDocs(collection(db, "appointments"));
            setAppointments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchAppointments();
    }, []);

    const signIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in: ", error);
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-xl font-bold">Lynn's Dashboard</h2>
            <button onClick={signIn} className="mt-4 p-2 bg-blue-500 text-white rounded">Sign in with Google</button>
            <Calendar onChange={setDate} value={date} className="mt-4 mx-auto" />
            <h3 className="mt-4">Appointments for {date.toDateString()}:</h3>
            <ul className="mt-2">
                {appointments.filter(app => app.date === date.toDateString()).map((appointment) => (
                    <li key={appointment.id} className="my-2">
                        {appointment.time} - {appointment.name} ({appointment.subject})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;

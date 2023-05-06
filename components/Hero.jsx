import { useState } from "react";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

export default function Hero() {
    const options = ["Leetcode", "GFG", "GitHub"];

    const [selectedSite, setSelectedSite] = useState("leetcode");
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');

    let onSelect = (event) => {
        const site = event.value.toLowerCase();
        setSelectedSite(event.value);
        console.log(event);
    }

    let handleChange = (e) => {
        const username = e.target.value;
        setUserName(username);
        console.log(e.target.value);
    }

    let DropdownList = () => {
        const defaultOption = options[0];

        return (
            <Dropdown options={options} onChange={onSelect} value={defaultOption} placeholder="Select an option" />
        );
    }

    let getStats = async () => {
        console.log('i am here', selectedSite);
        if (selectedSite === 'leetcode') {
            const BACKEND_URI = 'http://localhost:3000';
            const response = await axios.get(`${BACKEND_URI}/api/user/${selectedSite}/${userName}`)


            console.log('response is', response);
        }
    }

    return (
        <div className="w-full ">
            <div className="flex flex-col justify-center text-justify items-center mx-2 gap-2 mt-2">
                <h1 className="text-2xl">Code Analytics made Easy</h1>

                <p className="text-xs text-center">Get deep insights into any coder's performance with our platform. </p>

                <p className="hidden">Discover their coding strengths and weaknesses, check their progress over time, and compare their skills to others. Leverage the power of data to enhance your coding journey.</p>

                <div className="flex gap-2">
                    {DropdownList()}
                    <input type="text" onChange={handleChange} className="border-2" placeholder="Enter your username" />
                    <button type="button" className="border-2 p-1" text="Search"><MagnifyingGlassIcon className="h-6 w-6 text-blue-500" onClick={getStats} /></ button>
                </div>
            </div>
        </div>
    );
}
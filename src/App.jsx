import React, { useRef, useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  
  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  
  const contractAddress = "0xEcbB0E37aD6eDD128c6b600099Fb1D4F8Bbdc548";
  const contractABI = abi.abi;

  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        await getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
        await getAllWaves();
      
    } catch (error) {
      console.log(error)
    }
  }

   const [allWaves, setAllWaves] = useState([]);
   const [message, setMessage] = useState("");
   const inputRef = useRef(null);
  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

       setMessage(inputRef.current.value);

        // console.log("value is :: ", inputRef.current.value);
        const messageValue = inputRef.current.value;
        
        // console.log("Message ::::  ", messageValue);
        
        if (messageValue != "") {
        const waveTxn = await wavePortalContract.wave(messageValue, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        const count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        await getAllWaves();
        inputRef.current.value = "";  
        } else {
          alert("Please Type your message!");
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      console.log(error.message)
      if (error.message.includes("Wait 15m")) {
        alert("Dont Spam, wait for 15 min")
      } else {
        alert("Connect to Metamask to wave!!")
      }
      
    }
  }

    const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

        // wavePortalContract.on("NewWave", (from, timestamp, message) => {
        //   console.log("NewWave", from, timestamp, message);

        //   setAllWaves(prevState => [...prevState, {
        //     address: from,
        //     timestamp: new Date(timestamp * 1000),
        //     message: message
        //   }]);
        // });
        
        // console.log("Address : ", wavesCleaned.address)
        // console.log("Timestamp : ", wavesCleaned.timestamp)
        // console.log("Message : ", wavesCleaned.message)
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  // useEffect(() => {
  //   checkIfWalletIsConnected();
    /**
 * Listen in for emitter events!
 */
useEffect(() => {
  checkIfWalletIsConnected();
  // let wavePortalContract;

  // const onNewWave = (from, timestamp, message) => {
  //   console.log("NewWave", from, timestamp, message);
  //   setAllWaves(prevState => [
  //     ...prevState,
  //     {
  //       address: from,
  //       timestamp: new Date(timestamp * 1000),
  //       message: message,
  //     },
  //   ]);
  // };

  // if (window.ethereum) {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner();

  //   wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  //   wavePortalContract.on("NewWave", onNewWave);
  // }

  // return () => {
  //   if (wavePortalContract) {
  //     wavePortalContract.off("NewWave", onNewWave);
  //   }
  // };
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 My First Dapp
        </div>
        <div className="bio">
          I am Vinay Kumar!! Connect your Ethereum wallet and wave at me!
        <br></br>
          You can follow me on Twitter <a href="https://twitter.com/R007_BR34K3R">@R007_BR34K3R</a>
        </div>

<br></br>
      <form onSubmit={wave}>
      <label> <div className="inputmessage">Enter your Message </div><br></br>
        <textarea rows="4" cols="50" className="inputbox"
         ref={inputRef}
        type="text"
        id="message"
        name="message"
        />
      </label>       
      </form>
            <button className="waveButton" onClick={wave}>
           Wave at Me
          </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      <br></br>
          <div className="bio">
          Donate some goerli Here: 
            <br></br>0x0caBBaBCfa6ef9cC8e39A1316a4244b86DC496C4
        </div>
      <br></br>        
        {allWaves.map((wave, index) => (
  <table key={index} >
    <div key={index} className="messages">
    <div className="message-item"> 
  <tr key={index} >
    <td key={index}>Message</td> 
    <td>:&nbsp;&nbsp;&nbsp;{wave.message}</td>
  </tr>
  <tr>
    <td>From</td> 
    <td>:&nbsp;&nbsp;&nbsp;{wave.address}</td>
    </tr>
  <tr>
    <td>Time</td> 
    <td>:&nbsp;&nbsp;&nbsp;{wave.timestamp.toString()}</td>
    </tr>
      </div>
</div>
  </table>

))}
      </div>
    </div>
  );
}

export default App
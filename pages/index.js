import React, { useState, useEffect } from "react";
import Head from "next/head";
import ConfettiGenerator from "confetti-js";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import PokeJSON from "../abi/Poke.json";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [poking, setPoking] = useState(false);
  const [pokes, setPokes] = useState([]);
  const [pokeMessage, setPokeMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const contractAddress = "0xcB4e716eDe197649a10a6241a3d3FcC59A20C46a";
  const contractABI = PokeJSON.abi;

  const checkIfWalletConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install metamask extension first");
        return;
      }

      // Check if we are authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length === 0) {
        console.log("Please connect your wallet first");
        return;
      }

      const account = accounts[0];
      console.log("Wallet Connected with address: ", account);
      setCurrentAccount(account);
      await getAllPokes();
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      const networkId = await ethereum.request({ method: "eth_chainId" });
      // Make sure the user is on the Rinkeby test network or they will have to pay real $ :P
      if (networkId !== "0x4") {
        alert("Please connect to the Rinkeby test network");
        return;
      }

      if (!ethereum) {
        alert("Please install metamask extension first");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const poke = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const pokeContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await pokeContract.getTotalPokes();
        console.log("Retrieved total poke count...", count.toNumber());

        // Create a new poke
        setPoking(true);
        setSuccess(false);
        const pokeTxn = await pokeContract.poke(pokeMessage, {
          gasLimit: 300000,
        });
        console.log("Minting...", pokeTxn.hash);

        await pokeTxn.wait();
        console.log("Minted -- ", pokeTxn.hash);

        setSuccess(true);
        setPoking(false);
        count = await pokeContract.getTotalPokes();
        console.log("Retrieved total poke count...", count.toNumber());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllPokes = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const pokeContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const pokes = await pokeContract.getAllPokes();
      let pokesCleaned = [];
      pokes.forEach((poke) => {
        pokesCleaned.push({
          address: poke.poker,
          timestamp: new Date(poke.timestamp * 1000),
          message: poke.message,
        });
      });
      setPokes(pokesCleaned);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePokeMessageChange = (event) => {
    setPokeMessage(event.target.value);
  };

  useEffect(() => {
    // check if wallet is connected
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    const confettiSettings = { target: "my-canvas" };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    return () => confetti.clear();
  }, []);

  useEffect(() => {
    const { ethereum } = window;
    let pokeContract = null;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      let pokeContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      pokeContract.on("NewPoke", (poker, timestamp, message) => {
        setPokes((pokes) => [
          ...pokes,
          {
            address: poker,
            timestamp: new Date(timestamp * 1000),
            message: message,
          },
        ]);
      });
    }

    return () => pokeContract.removeAllListeners();
  }, [contractABI]);

  return (
    <div className={styles.container}>
      <Head>
        <title>My Poke Portal</title>
        <meta name="description" content="Send pokes on-chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Hey! I am <a href="https://twitter.com/0xKrome">@0xKrome</a>
        </h1>

        <div>
          <p style={{ fontSize: 30 }}>
            I am a software engineer learning to build Decentralized
            Applications{" "}
          </p>
          <br />
          {!currentAccount ? (
            <button
              style={{ width: "100%", cursor: "pointer", height: 80 }}
              onClick={connectWallet}
            >
              Connect Wallet to unlock more features
            </button>
          ) : (
            <>
              <textarea
                style={{ width: "100%", height: 150 }}
                onChange={handlePokeMessageChange}
              />
              <button
                disabled={poking}
                style={{ width: "100%", cursor: "pointer", height: 80 }}
                onClick={poke}
              >
                <p style={{ fontSize: 16 }}>
                  {poking ? "Poking..." : "👉 Poke Me 👈"}
                </p>
              </button>
              <p style={{ textAlign: "center" }}>
                Connected Address: {currentAccount}
              </p>

              <div style={{ marginTop: 40 }}>
                <h2 style={{ textAlign: "center" }}>Previous Pokes</h2>
                {pokes
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((poke, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "OldLace",
                        marginTop: "16px",
                        padding: "8px",
                      }}
                    >
                      <div>Address: {poke.address}</div>
                      <div>Time: {poke.timestamp.toString()}</div>
                      <div>Message: {poke.message}</div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
        <canvas
          id="my-canvas"
          style={{
            visibility: success ? "inherit" : "hidden",
            zIndex: -1,
            position: "absolute",
            left: 0,
          }}
        ></canvas>
      </main>
    </div>
  );
}

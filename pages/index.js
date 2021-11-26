import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);

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

  useEffect(() => {
    // check if wallet is connected
    checkIfWalletConnected();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>My Wave Portal</title>
        <meta name="description" content="Send waves on-chain" />
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
              <button
                style={{ width: "100%", cursor: "pointer", height: 80 }}
                onClick={null}
              >
                <p style={{ fontSize: 16 }}>👉 Poke Me 👈</p>
              </button>
              <p style={{ textAlign: "center" }}>
                Connected Address: {currentAccount}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

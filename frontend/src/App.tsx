import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";
import { createTheme, ThemeProvider } from "@material-ui/core";
import HomeHero from "./pages/Home/Home";
import MainTemplete from "./layouts";
import Staking from "./pages/staking";
import {
  getPhantomWallet,
  getSolletExtensionWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";
const network = WalletAdapterNetwork.Mainnet;

const theme = createTheme({
  palette: {
    type: "dark",
  },
  overrides: {
    MuiButtonBase: {
      root: {
        justifyContent: "flex-start",
      },
    },
    MuiButton: {
      root: {
        textTransform: undefined,
        padding: "12px 16px",
      },
      startIcon: {
        marginRight: 8,
      },
      endIcon: {
        marginLeft: 8,
      },
    },
  },
});

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolletExtensionWallet({ network }),
      getSolletWallet({ network }),
      getSolflareWallet(),
    ],
    []
  );

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={true}>
            <WalletDialogProvider>
              <MainTemplete>
                <Switch>
                  <Route path="/" exact>
                    <HomeHero />
                  </Route>
                  <Route path="/stake" exact>
                    <Staking />
                  </Route>
                </Switch>
              </MainTemplete>
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

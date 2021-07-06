import React, { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import configs from "../../configs";

import {
  Box,
  Grid,
  Button,
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';

var web3 = new Web3(new Web3.providers.HttpProvider(configs.INFRA_MAINNET_URL));

function BlockView() {

  const pageLimit = 30;
  const [blockNo, setBlockNo] = useState(-1);
  const [block, setBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const blockTimer = useRef(null);
  const prevBlock = useRef(-1);
  const tblFields = ["No","From","To","Gas","Amount"];

  const getBlockInfo = async (blockNumber) => {
    let currentBlock = await web3.eth.getBlock(blockNumber);

    const transactionReqs = [];
    if (!currentBlock || !currentBlock.transactions || !currentBlock.transactions.length === 0 ) return;
    setBlockNo(blockNumber);
    setBlock({
      id: currentBlock.number,
      totalDifficulty: currentBlock.totalDifficulty,
      totalTransactions: currentBlock.transactions.length,
      miner: currentBlock.miner,
    });
    setLoadingItem(true);
    setTransactions([]);
    const nLength = currentBlock.transactions.length > pageLimit ? pageLimit : currentBlock.transactions.length;
    for (let i = 0; i < nLength; i++) {
      if (blockNumber !== prevBlock.current) break;
      await transactionReqs.push(
        web3.eth.getTransactionFromBlock(blockNumber, i).then((value) => {
          if (value && processing) {
            const item = {
              id: value.hash,
              value: value.value,
              from: value.from,
              gas: value.gas,
              to: value.to,
            };
            addTransaction(item, blockNumber);
          }
        })
      );
    }
    setLoadingItem(false);
  };

  const addTransaction = (item, blockNumber) => {
    if (blockNumber !== prevBlock.current) return;
    setTransactions((value) => {
      const sortedArr = [...value, item].sort((a, b) => {
        return parseInt(b.value) - parseInt(a.value);
      });
      return sortedArr;
    });
  };

  const getLatestBlock = async () => {
    if (loading) return;
    setLoading(true);
    let latestBlockNo = await web3.eth.getBlockNumber();
    if (
      !isNaN(latestBlockNo) &&
      parseInt(latestBlockNo) > parseInt(prevBlock.current)
    ) {
      prevBlock.current = latestBlockNo;
      getBlockInfo(latestBlockNo);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (processing) {
      getLatestBlock();
      blockTimer.current = setInterval(getLatestBlock, configs.TIME_INTERVAL);
    } else {
      clearInterval(blockTimer.current);
    }
    return () => {
      if (blockTimer.current) {
        clearInterval(blockTimer.current);
        blockTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  return (
    <Box mt={8} p={8}>
      <Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disableElevation
          onClick={() => {
            setProcessing(!processing);
          }}
        >
          {processing ? <><StopIcon> </StopIcon> Pause </> : <><PlayArrowIcon> </PlayArrowIcon> Start </>}
        </Button>
      </Box>

      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item md={3}>
            <Typography variant="h6">Block Number:</Typography>
          </Grid>
          <Grid item md={3}>
            <Typography variant="h6">
              {blockNo !== -1 ? blockNo : ""}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item md={3}>
            <Typography variant="h6">Number of Transaction:</Typography>
          </Grid>
          <Grid item md={3}>
            <Typography variant="h6">
              {" "}
              {block ? block.totalTransactions : ""}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item md={3}>
            <Typography variant="h6">Miner:</Typography>
          </Grid>
          <Grid item md={3}>
            <Typography variant="h6">{block ? block.miner : ""}</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item md={3}>
            <Typography variant="h6">Total Difficulty:</Typography>
          </Grid>
          <Grid item md={3}>
            <Typography variant="h6">
              {block ? block.totalDifficulty : ""}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box mt={3} >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {
                  tblFields.map((field,index) => (
                    <TableCell key={index}>{field}</TableCell>
                  ))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.from}</TableCell>
                    <TableCell>{item.to}</TableCell>
                    <TableCell>{item.gas}</TableCell>
                    <TableCell>{item.value}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <center>{loadingItem ? "Fetching Transactions..." : "No Transactions!"}</center>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default BlockView;

import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography } from "@material-ui/core";
import TimerIcon from '@material-ui/icons/Timer';
import BlockView from "../BlockView";

const App = () => {
  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <TimerIcon></TimerIcon>
          <Typography variant="h6" noWrap>
            &nbsp;Web3 Test Project - Ethereum Blockchains
          </Typography>
        </Toolbar>
      </AppBar>
      <Box>
        <Router>
          <Route exact path="/" component={BlockView} />
        </Router>
      </Box>
    </Box>
  );
};

export default App;

import "./stake.css";
import Gif from "../../assets/gifFile.gif";
import Png0 from "../../assets/0.png";
import Png1 from "../../assets/1.png";
import Png2 from "../../assets/2.png";
import Png3 from "../../assets/3.png";
import Png4 from "../../assets/4.png";
import Png5 from "../../assets/5.png";
import Png6 from "../../assets/6.png";

import { Box, Flex } from "../../components/Box";
import useViewport from "../../hooks/useViewport";
import { Button } from "reactstrap";
import Sliders from "../../components/Slider";

const Staking = () => {
  const { width } = useViewport();

  const isMobile = width <= 990;

  return (
    <Box mt={isMobile? "160px" :"80px"}>
      <Flex
        width={"100%"}
        alignItems={"center"}
        flexDirection={"column"}
        justifyContent={"center"}
      >
        <img src={Gif} alt="" height={"100px"} />
        <div className="welcome">Welcome to the</div>
        <div className="lion-text">LIONS DEN</div>
        <Flex mt={"20px"} mb={"10px"} justifyContent={"space-between"}>
          <Button className="stake-btn">All</Button>
          <Button className="stake-btn">Stake</Button>
          <Button className="unstake-btn">Unstake</Button>
        </Flex>
        <div className="metalion-text">Your Metalion Collection</div>
      </Flex>

      <Flex width={"100%"} alignItems={"center"} justifyContent={"center"}>
        <Box height={"600px"} width={"80%"}>
          <Sliders itemOverFlow={true}>
            {[Png0,Png1, Png2, Png3, Png4, Png5, Png6].map((item, index) => {
              return (
                <Flex key={index} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} >
                  <img src={item} alt="" height={"330px"} width={"350px"} />
                  <Flex
                    mt={"20px"}
                    mb={"10px"}
                    justifyContent={"space-between"}
                  >
                    <Button className="stake-btn">Select</Button>
                    <Button className="unstake-btn">unSelect</Button>
                  </Flex>
                </Flex>
              );
            })}
          </Sliders>
        </Box>
      </Flex>

      <Flex
        width={"100%"}
        alignItems={"center"}
        flexDirection={"column"}
        justifyContent={"center"}
      >
        <div className="metalion-text">CHOOSE THE LOCKUP DURATION</div>
        <Flex mt={"20px"} mb={"10px"} justifyContent={"space-between"}>
          <Button className="stake-btn">30 Days</Button>
          <Button className="stake-btn">90 Days</Button>
          <Button className="unstake-btn">180 Days</Button>
        </Flex>
        <Flex mt={"20px"} mb={"10px"} justifyContent={"space-between"}>
          <Button className="stake-btn">Stake</Button>
          <Button className="unstake-btn">Unstake</Button>
        </Flex>
        <Box className="Border-box">
          <div className="total-reward">Total Reward</div>
          <div className="total-reward">0 ML</div>
        </Box>
      </Flex>
    </Box>
  );
};

export default Staking;

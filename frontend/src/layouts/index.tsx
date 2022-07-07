import "./index.css";
import Header from "../components/Header/Header";

const MainTemplete: React.FC = ({ children }) => {
  return (
    <div className="bg-black">
      <div className=" app-max-width">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default MainTemplete;

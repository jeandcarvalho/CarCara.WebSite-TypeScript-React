import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-zinc-900 text-white py-4">
    <div className="container mx-auto text-center">
      <p className="text-sm px-2">&copy; 2024 GSA. All rights reserved.</p>
      <nav className="mt-2">
        <Link to={"/"}>
          <a className="text-zinc-400 hover:text-white mx-2">Home</a>
        </Link>
        <Link to={"/Search"}>
          <a className="text-zinc-400 hover:text-white mx-2">Acquisitions</a>
        </Link>
        <Link to={"/About"}>
          <a className="text-zinc-400 hover:text-white mx-2">About</a>
        </Link>
        <Link to={"/OurModels"}>
          <a href="/ourmodels" className="text-zinc-400 hover:text-white mx-2">Our Models</a>
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;

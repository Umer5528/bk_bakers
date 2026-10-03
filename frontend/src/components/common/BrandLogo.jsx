import logo from "../../assets/logo.png";

// The client's actual logo — background removed (it shipped on a plain
// white square) so it sits naturally on any of our tinted surfaces
// instead of reading as a sticker pasted on top of the page.
const BrandLogo = ({ size = 44, className = "" }) => (
  <img
    src={logo}
    alt="Bk_Bakers"
    style={{ height: size, width: "auto" }}
    className={`select-none drop-shadow-sm ${className}`}
    draggable={false}
  />
);

export default BrandLogo;

import React from "react";
import { Link } from "react-router";
import { Brand, Icon } from "./Common.jsx";
export default function Footer({ marketplacePath }) {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-story">
          <Brand light />
          <p>
            Rooted in our coast.
            <br />
            Connected to new possibilities.
          </p>
          <span className="footer-tag">
            <span className="status-dot" />
            Made for Sri Lanka’s fishing communities
          </span>
        </div>
        <div>
          <h3>Explore HarborX</h3>
          <Link to="/#about">About us</Link>
          <Link to="/#services">Our services</Link>
          <Link to="/#gallery">Life at the harbor</Link>
          <Link to="/#how-it-works">How it works</Link>
        </div>
        <div>
          <h3>Make a connection</h3>
          <Link to={marketplacePath}>Browse auctions</Link>
          <Link to="/register">Become a seller</Link>
          <Link to="/register">Become a buyer</Link>
          <Link to="/login">Sign in</Link>
        </div>
        <div>
          <h3>Let’s talk</h3>
          <p>
            Ready to connect with your harbor?
            <br />
            Create an account or sign in to get started.
          </p>
          <Link to="/register" className="footer-contact">
            Join HarborX <Icon name="ArrowUpRight" size={17} />
          </Link>
          <small>Choose Buyer or Seller during registration.</small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} HarborX. Fish Harbor Catch & Auction
          Management.
        </span>
        <div>
          <a href="/public-home/image-credits.html">Photo credits</a>
          <span>Connected coastal communities</span>
        </div>
      </div>
    </footer>
  );
}

# 📖 The Engineer's Shelf — Online Bookstore

A front-end online bookstore for engineering students, built with HTML frames, CSS and
vanilla JavaScript, with no backend or libraries. Browse books by department, save
favourites, and go through a complete cart → checkout → payment → order history flow.

🔗 **Live demo:** https://aaditi297.github.io/bookstore-the-engineers-shelf/
*(works once GitHub Pages is turned on under Settings → Pages)*

## Features
- **Catalogue:** 17 books across CSE, ECE, EEE and Civil, with search, sorting, section filters and grid/list view
- **Wishlist:** save books with the ♥ button and move them to the cart
- **Cart:** quantity controls, free-shipping progress bar, live cart and wishlist counters
- **Registration:** field validation and a password strength meter
- **Login:** "Remember me" option and a show/hide password button
- **Checkout:** delivery form validation and a Cart → Delivery → Payment → Done progress bar
- **Payment:** demo payment page with card, UPI, net banking and cash on delivery (no real money is charged)
- **Order history:** per-user orders showing items, payment method and total, with an "Order again" button

## Tech stack
- HTML (frames)
- CSS
- JavaScript (ES6)
- Browser localStorage / sessionStorage for data

## How to run
1. Clone or download this repository:
```bash
   git clone https://github.com/Aaditi297/bookstore-the-engineers-shelf.git
```
2. Open `index.html` in your browser.

## Project structure
| File | Purpose |
|------|---------|
| `index.html` | Frameset that loads the top bar, side panel and main page |
| `top.html`, `nav.html` | Top navigation bar and side panel |
| `home.html`, `catalogue.html`, `cart.html`, `wishlist.html` | Shopping pages |
| `login.html`, `register.html` | Accounts |
| `checkout.html`, `payment.html`, `orders.html` | Checkout flow and order history |
| `script.js` | All logic: book data, cart, wishlist, accounts, payment, orders |
| `style.css` | Styling |

## How data is stored
Everything is saved in the visitor's own browser (localStorage), so accounts and orders
are not shared between devices or browsers, and clearing browser data removes them.
Passwords are stored as hashes, and card details are never saved.

> ⚠️ This is a demo project. The payment page is simulated and the project is not
> suitable for real payments or real user data.

## Demo tips
- Register an account, then log in.
- Add books to the cart and proceed to checkout.
- On the payment page, any 16-digit card number works; a card ending in `0002` is declined to show the failure case.
- Open **My Orders** to see your order history.

## Possible improvements
- Node.js/Express backend with a database for real accounts and orders
- Real payment gateway (Razorpay or Stripe test mode)
- Admin page to manage books and orders
- Fully responsive layout without frames

## Author
Made by [Aaditi](https://github.com/Aaditi297)

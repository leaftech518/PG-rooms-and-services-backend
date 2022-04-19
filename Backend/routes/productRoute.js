const express = require("express");
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDescription , productReview } = require("../controllers/productController");
const { isAuthenticatedUser , authorizedRoles} = require("../middleware/auth");

const router = express.Router();

router.route("/products").get(isAuthenticatedUser, getAllProducts  );
router.route("/product/new").post(isAuthenticatedUser , authorizedRoles("admin"), createProduct );
router.route("/product/:id").put( isAuthenticatedUser , authorizedRoles("admin") ,updateProduct).delete(isAuthenticatedUser,  authorizedRoles("admin"), deleteProduct).get(getProductDescription);
router.route("/review").put(isAuthenticatedUser , productReview);

module.exports  = router;


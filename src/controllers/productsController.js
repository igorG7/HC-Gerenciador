const Products = require("../models/ProductsModel");

exports.getProducts = async (req, res) => {
  try {
    const products = await Products.find({
      $or: [
        { productName: { $regex: req.query.productName || "", $options: "i" } },
        {
          providerName: { $regex: req.query.providerName || "", $options: "i" },
        },
        {
          makerName: { $regex: req.query.makerName || "", $options: "i" },
        },
      ],
    }).sort({ productName: 1 });

    if (!products.length) {
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json({
      message: "Products successfully recovered,",
      data: products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

exports.findProductbyId = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Produto não encontrado" });

    res.status(200).json({ product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const body = req.body;

    const checkExistence = await checkProductExistence(body);

    if (checkExistence) {
      throw new Error("Esse produto já existe.");
    }

    body.modified = Date.now();
    body.userModified = res.locals.user.userName;

    const product = new Products(body);
    await product.save();

    res
      .status(201)
      .json({ status: "success", message: "Produto cadastrado com sucesso." });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message || "Erro ao cadastrar produto.",
    });
  }
};

exports.updateProducts = async (req, res) => {
  try {
    const body = req.body;

    const checkExistence = await checkProductExistence(body, req.params.id);

    if (checkExistence) {
      throw new Error("Esse produto já existe.");
    }

    body.modified = Date.now();
    body.userModified = res.locals.user.userName;

    const product = await Products.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Produto não encontrado" });

    res
      .status(200)
      .json({ status: "success", message: "Produto atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "Erro ao atualizar produto",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Products.findByIdAndDelete(req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Produto não encontrado" });

    res
      .status(200)
      .json({ status: "success", message: "Produto excluído com sucesso" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Erro ao tentar deletar produto",
    });
  }
};

const checkProductExistence = async (body, id) => {
  try {
    return await Products.findOne({
      _id: { $ne: id },
      productName: body.productName,
      makerName: body.makerName,
      providerName: body.providerName,
    });
  } catch (error) {
    console.log(error);
  }
};

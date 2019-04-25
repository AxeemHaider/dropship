// import require libraries

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const logger = require('morgan');
const AliexScrape = require('aliexscrape');
const WooCommerceAPI = require('woocommerce-api');
const converter = require('./converter');
const variations = require('./variations');
const taskQueue = require('./createTask');

app.enable('trust proxy');

app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(logger('dev'));

var WooCommerceTest = new WooCommerceAPI({
  url: 'https://shop.octabyte.org/', // Your store URL
  consumerKey: 'ck_972f1a3b1bdabefcb8c097c496f7b6eb2deef28f', // Your consumer key
  consumerSecret: 'cs_e9ee41b5c7764055d552ca5ef851f11fb5860067', // Your consumer secret
  wpAPI: true, // Enable the WP REST API integration
  version: 'wc/v3' // WooCommerce WP REST API version
});


var WooCommerce = new WooCommerceAPI({
  url: 'https://shopofine.com/', // Your store URL
  consumerKey: 'ck_ddc1d09caf0874344068c02d61f880bf136280f5', // Your consumer key
  consumerSecret: 'cs_f5c698061823af8829b11d29c7bdfebe802dc957', // Your consumer secret
  wpAPI: true, // Enable the WP REST API integration
  version: 'wc/v3' // WooCommerce WP REST API version
});

// Handle the CORS
app.use((req, res, next) => {
	
	// Allow all domain to access this API
	// Replace the star(*) with domain name to restrict this API
	
	res.header('Access-Control-Allow-Origin', '*'); 
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 
	
	if(req.method === 'OPTIONS'){
		
		// Allow only these specific methods to this API
		
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});	
	}
	
	next();
});

app.get('/', (req, res, next) => {
	res.status(200).json({
		message: "Welcome"
	});
});

app.post('/test', (req, res, next) => {
	
	var data = req.body;
	
	console.log(data);
	
	res.status(200).json({
		task_complete: true,
		response: data
	});
});

app.get('/test64', (req, res, next) => {
	var payloadData = "32678087225:409";
		
		var optionData = {
			payload: payloadData
		};
		
	var data = Buffer.from(optionData.payload).toString(
      'base64'
    );
	
	res.status(200).json({
		message: data
	});
});

app.get('/test_product', (req, res, next) => {
	// 32512588340
	// 32846817739
	AliexScrape(32957197049)
    .then(response => {
		const product = JSON.parse(response);
		
		if(product.variations[0].skuAttr != undefined){
		
			var data = {
				name: product.productTitle,
				sku: 'shopo12-'+product.productId+"137",
				type: 'variable',
				categories: [
					{
					  id: 115
					}
				  ],
				images: converter.product_images(product.pics),
				attributes: converter.product_attributes(product.attributes),
				description: converter.product_description(product.properties)
			};
			
			var variationData = {
						create: variations.product_variation(product.variations, product.attributes)
					};
			
			res.status(200).json(product);	
				
			/*WooCommerceTest.post('products', data, function(err, CBdata, response) {
				var productResponse = JSON.parse(response);
				
				if(productResponse.status == 'publish'){
				
					var variationData = {
						create: variations.product_variation(product.variations, product.attributes)
					};
					
					WooCommerceTest.post('products/'+productResponse.id+'/variations/batch', variationData, function(err, Vdata, variationResponse) {
						res.status(200).json({
							message: "Product is successfully added."
						});
						//res.status(200).json(JSON.parse(variationResponse));
					});
					
				}else{
					res.status(200).json(productResponse);
				}
				
			});*/
		
		}else{
			var data = {
			name: product.productTitle,
			sku: 'shopo12-'+product.productId+"137",
			type: 'simple',
			regular_price: product.variations[0].pricing,
			categories: [
				{
				  id: 115
				}
			  ],
			images: converter.product_images(product.pics),
			attributes: converter.product_attributes(product.attributes),
			description: converter.product_description(product.properties)
			};
			/*WooCommerceTest.post('products', data, function(err, CBdata, response) {
				res.status(200).json({
					message: "Product is successfully added."
				});
			});*/
			
			res.status(200).json(product);	
		}
		
	})
    .catch(error => {
		res.status(200).json(JSON.parse(error));
	});
});

app.get('/test_categories', (req, res, next) => {
	WooCommerce.get('products/categories', function(err, data, response) {
		
		var data = JSON.parse(response);
		
		res.status(200).json(data);
		
	});
});

app.get('/categories', (req, res, next) => {
	
	var categories = [];
	
	WooCommerce.get('products/categories', function(err, data, response) {
		
		var data = JSON.parse(response);
		
		for(var i=0; i<data.length; i++){
			categories.push({
				id: data[i].id,
				name: data[i].name
			});
		}
		
		res.status(200).json(categories);
		
	});
	
});

app.post('/push_product', (req, res, next) => {
	
	var data = req.body;
	var taskTime = 15;
	
	for(var i=0; i<data.length; i++){
		
		var payloadData = data[i].productId + ":" + data[i].category;
		
		var optionData = {
			payload: payloadData,
			inSeconds: taskTime
		};
		
		taskQueue.createTask(optionData);
		
		taskTime = taskTime + 15;
		
	}
	
	res.status(200).json({
		task_complete: true
	});
});

app.post('/publish_product', (req, res, next) => {
	
	var reqBody = Buffer.from(req.body, 'base64').toString();
	var bodyArray = reqBody.split(":");
	
	var reqProductId = bodyArray[0];
	var reqProductCategory = bodyArray[1];
	
	console.log(reqProductId);
	console.log(reqProductCategory);
	
	if(reqProductId == undefined){
		res.status(200).json({
			message: "Product id is not defined"
		});
		return;
	}
	
	//32829169130
	AliexScrape(reqProductId)
    .then(response => {
		
		const product = JSON.parse(response);
		
		if(product.variations[0].skuAttr != undefined){
				
			var data = {
				name: product.productTitle,
				sku: 'shopo-'+product.productId+"137",
				type: 'variable',
				categories: [
					{
					  id: reqProductCategory
					}
				  ],
				images: converter.product_images(product.pics),
				attributes: converter.product_attributes(product.attributes),
				description: converter.product_description(product.properties)
			};
			
			WooCommerce.post('products', data, function(err, CBdata, response) {
				var productResponse = JSON.parse(response);
				
				if(productResponse.status == 'publish'){
				
					var variationData = {
						create: variations.product_variation(product.variations, product.attributes)
					};
					
					WooCommerce.post('products/'+productResponse.id+'/variations/batch', variationData, function(err, Vdata, variationResponse) {
						res.status(200).json({
							message: "Product is successfully added"
						});
						//res.status(200).json(JSON.parse(variationResponse));
					});
					
				}else{
					res.status(200).json(productResponse);
				}
				
			});
			
		}else{
			var data = {
				name: product.productTitle,
				sku: 'shopo-'+product.productId+"137",
				type: 'simple',
				regular_price: product.variations[0].pricing,
				categories: [
					{
					  id: reqProductCategory
					}
				  ],
				images: converter.product_images(product.pics),
				attributes: converter.product_attributes(product.attributes),
				description: converter.product_description(product.properties)
			};
			
			WooCommerce.post('products', data, function(err, CBdata, response) {
				res.status(200).json({
					message: "Product is successfully added."
				});
			});
			
		}	
		
	})
    .catch(error => {
		res.status(200).json(JSON.parse(error));
	});
	
});

module.exports = app;
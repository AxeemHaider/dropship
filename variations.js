// product variations formate

const converter = require('./converter');
const rate = 1.2;

exports.product_variation = (productVariations, productAttributes) => {
	
	var variations = [];
	
	for(var i=0; i < productVariations.length; i++){
		
		var attributes = [];
		var attrImage;
		
		var skuAttr = productVariations[i].skuAttr;
		var attrArr = skuAttr.split(";");
		
		for(var j=0; j < attrArr.length; j++){
			
			if(attrArr[j].indexOf("#") > -1){
				
				var optionName = attrArr[j].split("#")[1];
				var optionImage = converter.attribute_image(productAttributes, optionName);
				
				if(optionImage != undefined){
					attrImage = optionImage;
				}
				
				var attrName = converter.attribute_name(productAttributes, optionName);

				if(attrName.indexOf("Ships From") == -1){
				
					attributes.push({
						name: attrName,
						option: optionName
					});
					
				}
				
			}else{
				
				var optionId = attrArr[j];
				var optionName = converter.option_name_by_id(productAttributes, optionId);
				
				var optionImage = converter.attribute_image(productAttributes, optionName);
				
				if(optionImage != undefined){
					attrImage = optionImage;
				}
				
				var attrName = converter.attribute_name(productAttributes, optionName);
				
				if(attrName.indexOf("Ships From") == -1){
				
					attributes.push({
						name: attrName,
						option: optionName
					});
					
				}
			}
			
		}
		
		if(attrImage != undefined){
		
			variations.push({
				regular_price: productVariations[i].pricing * rate,
				sale_price: productVariations[i].discount * rate,
				image: {
					src: attrImage
				},
				attributes: attributes
			});
			
		}else{
			variations.push({
				regular_price: productVariations[i].pricing * rate,
				sale_price: productVariations[i].discount * rate,
				attributes: attributes
			});
		}
		
	}
	
	return variations;
	
};
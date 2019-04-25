// Convert Aliexpress data into our api

module.exports.product_images = (imagesArray) => {
	
	var images = [];
	
	for(var i=0; i< imagesArray.length; i++){
		images.push({ 'src': imagesArray[i] });
	} 
	
	return (images);
};

module.exports.product_attributes = (productAttributes) => {
	var attributes = [];
	
	for(var i=0; i < productAttributes.length; i++){
		
		var options = [];
	
		if(productAttributes[i].title.indexOf("Ships From") == -1){
		
			// Get the options
			for(var j=0; j < productAttributes[i].options.length; j++){
				options.push(productAttributes[i].options[j].text);
			}
			
		
		
			attributes.push({ 
				name: productAttributes[i].title,
				visible: true,
				variation: true,
				options: options
			});	
			
		}
		
	}
	
	
	
	return attributes;
};

exports.product_description = (productProperties) => {
	
	var description = "";
	
	for(var i=0; i < productProperties.length; i++){
		
		description += "<span class='c-property-title'>"+productProperties[i].propertyTitle +"</span> :: ";
		description += "<span class='c-property-description'>"+productProperties[i].propertyDescription + "</span><br>";
		
	}

	return description;	
};

exports.attribute_image = (productAttributes, name) => {
	
	for(var i=0; i < productAttributes.length; i++){
		
		for(var j=0; j < productAttributes[i].options.length; j++){
			
			if(name == productAttributes[i].options[j].text){
				return productAttributes[i].options[j].src;
			}
			
		}
		
	}
	
};

exports.attribute_name = (productAttributes, optionValue) => {

	for(var i=0; i < productAttributes.length; i++){
		
		for(var j=0; j < productAttributes[i].options.length; j++){
			
			if(optionValue == productAttributes[i].options[j].text){
				return productAttributes[i].title;
			}
			
		}
		
	}
		
};


exports.option_name_by_id = (productAttributes, optionId) => {

	for(var i=0; i < productAttributes.length; i++){
		
		for(var j=0; j < productAttributes[i].options.length; j++){
			
			if(optionId == productAttributes[i].options[j].optionId){
				return productAttributes[i].options[j].text;
			}
			
		}
		
	}
		
};









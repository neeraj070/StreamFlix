const url = 'https://imdb8.p.rapidapi.com/actors/get-interesting-jobs?nconst=nm0001667';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '2ece292388msh72624f895cc9326p142119jsn182dc3e2f6ee',
		'x-rapidapi-host': 'imdb8.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
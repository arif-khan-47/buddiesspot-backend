class ApiFeatures{
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
      }
    
      search() {
        const keyword = this.queryStr && this.queryStr.keyword 
          ? {
              name: {
                $regex: this.queryStr.keyword,
                $options: "i", //this means case sensitive
              },
            }
          : {};
        this.query = this.query.find({ ...keyword });
        return this;
      }    
      filter(){
        const queryCopy ={...this.queryStr}

        //Remove some fields for catagory
        const removeFields = ["keyword", "page", "limit"]
        removeFields.forEach(key=>delete queryCopy[key])

        //Filter for price and rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`)

        this.query = this.query.find(JSON.parse(queryStr))
        return this;
    }
    pagination(resutPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        //this will skip product to previous page
        const skip = resutPerPage * (currentPage - 1)
        //set limit
        this.query = this.query.limit(resutPerPage).skip(skip)

        return this;
    }
}

module.exports = ApiFeatures;
class APIFilters {
    constructor(query,queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }


    search() {
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword,
                $options:'i'
            
            }
        } : {};

        this.query = this.query.find({...keyword});
        return this;
    
    }


    filters() {
        const queryCopy = {...this.queryStr}

        const excludedFields = ["keyword","page"];
        excludedFields.forEach((el) => delete queryCopy[el])


        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
        this.query = this.query.find(JSON.parse(queryString));

        return this
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page)||1;
        const skip = resPerPage * (currentPage - 1);
        this.query = this.query.limit(resPerPage).skip(skip)
        return this;
      

    }

}

module.exports = APIFilters
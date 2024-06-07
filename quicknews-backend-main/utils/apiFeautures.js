class APIFeatures {
  constructor(query, queryString) {
    this.queryString = queryString; // constructor is the function that gets automatically called as soon as we create a new object out of this class
    this.query = query;
  }
  filter() {
    // 1a).FILTERING
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1b). ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    if (this.queryString.deviceId) {
      queryStr = JSON.stringify({
        ...JSON.parse(queryStr),
        deviceId: this.queryString.deviceId,
      });
    }

    this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      const sortObj = {};
      sortBy.split(' ').forEach((field) => {
        const sortOrder = field.startsWith('-') ? -1 : 1;
        sortObj[field.replace(/^-/, '')] = sortOrder;
      });
      this.query = this.query.sort(sortObj);
    } else {
      this.query = this.query.sort({ publishedDate: -1 });
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // here we used *1 because it converts string to number and we put ||1 because we want by default page no 1
    const limit = this.queryString.limit * 1 || 20; // here 100 means the page limit will be 100
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

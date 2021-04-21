class DbMocks {
    static PERSONS_REPOSITORY = new InMemoryPersonsRepository([
        new Person(1, "gigi1", "kent1", new Person(2, "gigi2", "kent2"),
            [{id: 1, name: "cat1", person: new Person(1, "gigi1", "kent1")},
                {id: 2, name: "cat2", person: new Person(1, "gigi1", "kent1")},
                {id: 3, name: "cat3", person: new Person(1, "gigi1", "kent1")}]),
        new Person(2, "gigi2", "kent2", new Person(1, "gigi1", "kent1"),
            [{id: 21, name: "cat21", person: new Person(2, "gigi2", "kent2")},
                {id: 22, name: "cat22", person: new Person(2, "gigi2", "kent2")},
                {id: 23, name: "cat23", person: new Person(2, "gigi2", "kent2")}]),
        new Person(4, "gigi4", "kent4", undefined,
            [{id: 41, name: "cat41"},
                {id: 42, name: "cat42", person: new Person(4, "gigi4", "kent4")},
                {id: 43, name: "cat43"}]),
        new Person(3, "gigi3", "kent3", new Person(4, "gigi4", "kent4"),
            [{id: 31, name: "cat31"},
                {id: 32, name: "cat32"},
                {id: 33, name: "cat33"}]),
        new Person(5, "gigi5", "kent5", undefined,
            [{id: 51, name: "cat51"},
                {id: 52, name: "cat52", person: new Person(3, "gigi3", "kent3")},
                {id: 53, name: "cat53"}]),
    ], Person.parse, DbMocks.parsePersonBeforeUpsert);

    static DOGS = DbMocks.dogsOf(10);

    static personsOf(count) {
        return _.times(count).map((val) => new Person(val, `gigi${val}`, `kent${val}`, undefined, [{
            id: `${val}1`,
            name: `cat${val}1`,
            person: new Person(val, `gigi${val}`, `kent${val}`)
        }, {
            id: `${val}2`,
            name: `cat${val}2`,
            person: new Person(val, `gigi${val}`, `kent${val}`)
        }]));
    }

    static dogsOf(count) {
        return _.times(count).map((val) => ({id: val, name: `dog ${val}`}));
    }

    static parsePersonBeforeUpsert(object) {
        // changing generated cat ids to valid, not generated ids
        if (object.cats != null && $.isArray(object.cats)) {
            object.cats.forEach(cat => {
                cat.id = DbMocks._dbLikeIdOf(cat.id);
            })
        }
        object.id = DbMocks._dbLikeIdOf(object.id);
        return Person.parse(object);
    }

    static _dbLikeIdOf(id) {
        if (EntityUtils.isInvalidId(id)) {
            return Math.abs(EntityUtils.generateId());
        } else if (EntityUtils.isIdGenerated(id)) {
            return Math.abs(id);
        }
        return id;
    }

    static DYNA_SEL_ONE_PERS_REPOSITORY = new InMemoryDynaSelOneRepository(DbMocks.PERSONS_REPOSITORY);
}

"use strict";

const assert = require("assert");
const Trie = require("../");
const util = require("util");
// ex. console.log(util.inspect(trie, false, null));

describe("Radix Trie", () => {
  describe("Add", () => {
    it("add a value to the tree.", () => {
      const trie = new Trie().add("foo", 5);

      assert.equal(trie.get("foo"), 5);
    });

    it("add values to the tree from an array to the constructor.", () => {
      const trie = new Trie([
        ["foo", 5],
        ["foos", 9]
      ]);

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("add values to the tree from a map to the constructor.", () => {
      const map = new Map([
        ["foo", 5],
        ["foos", 9]
      ]);
      const trie = new Trie(map);

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("add values to the tree from an object to the constructor.", () => {
      const trie = new Trie({
        foo: 5,
        foos: 9
      });

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("should only overwrite value.", () => {
      const trie = new Trie().add("foo", 5).add("foos", 4);
      assert.equal(trie.get("foo"), 5);

      trie.add("foo", 6);
      assert.equal(trie.get("foo"), 6);
      assert.equal(trie.get("foos"), 4);
    });

    it("add values to the tree from an array.", () => {
      const trie = new Trie().add([
        ["foo", 5],
        ["foos", 9]
      ]);

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("add values to the tree from a map.", () => {
      const map = new Map([
        ["foo", 5],
        ["foos", 9]
      ]);
      const trie = new Trie().add(map);

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("add values to the tree from an object.", () => {
      const trie = new Trie().add({
        foo: 5,
        foos: 9
      });

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("add two values to the tree, compressed.", () => {
      const trie = new Trie().add("foo", 5).add("foos", 9);

      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foos"), 9);
    });

    it("consolidates prefixes with new entries", () => {
      const trie = new Trie().add("foo", 5);

      assert.equal(trie.store.has("foo"), true);

      trie.add("faa", 3);

      assert.equal(trie.store.has("foo"), false);
      assert.equal(trie.store.has("f"), true);
      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("faa"), 3);
    });

    it("consolidates prefixes with new entries #2", () => {
      const trie = new Trie().add("foo", 5);

      assert.equal(trie.store.has("foo"), true);

      trie.add("foobar", 3).add("foobared");

      assert.equal(trie.store.has("foo"), true);
      assert.equal(trie.store.has("foobar"), false);
      assert.equal(trie.get("foo"), 5);
      assert.equal(trie.get("foobar"), 3);
      assert.equal(trie.get("foobared"), true);
    });
  });

  describe("Delete", () => {
    it("deletes a value.", () => {
      const trie = new Trie().add("foo", 5);

      assert.equal(trie.get("foo"), 5);

      trie.delete("foo");

      assert.equal(trie.get("foo"), null);
    });

    it("deletes a value with nodes.", () => {
      const trie = new Trie().add("foo", 5).add("foobar");

      assert.equal(trie.get("foo"), 5);

      trie.delete("foo");

      assert.equal(trie.get("foo"), null);
      assert.equal(trie.get("foobar"), true);
    });

    it("deletes a value split over more than one node", () => {
      const trie = new Trie().add("dog").add("doge").add("dogs");

      assert.equal(trie.get("doge"), true);
      trie.delete("doge");

      assert.equal(trie.get("doge"), null);
      assert.equal(trie.get("dog"), true);
      assert.equal(trie.get("dogs"), true);
    });

    it("deletes a value with more than one node", () => {
      const trie = new Trie().add("dog").add("doge").add("dogs");

      assert.equal(trie.get("doge"), true);
      trie.delete("dog");

      assert.equal(trie.get("doge"), true);
      assert.equal(trie.get("dogs"), true);
      assert.equal(trie.get("dog"), null);
    });

    it("chains deletes and additions together", () => {
      const trie = new Trie().add("dog").add("doge").add("dogs");

      assert.equal(trie.get("doge"), true);
      assert.equal(trie.get("dog"), true);
      trie.delete("dog").delete("doge");

      assert.equal(trie.get("doge"), null);
      assert.equal(trie.get("dogs"), true);
      assert.equal(trie.get("dog"), null);
      assert.equal(trie.store.keys().next().value, "dogs");
    });
  });

  describe("Get", () => {
    it("gets a value when it exists", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false);

      assert.equal(trie.get("bar"), 15);
      assert.equal(trie.get("barstool"), false);
    });

    it("returns null when a value does not exist", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false);

      assert.equal(trie.get("barkeep"), null);
      assert.equal(trie.get("barstool"), false);
    });
  });

  describe("Has", () => {
    it("returns true if a key exists", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false);

      assert.equal(trie.has("barstool"), true);
    });

    it("returns false when a key does not exist", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false);

      assert.equal(trie.has("barkeep"), false);
    });
  });

  describe("FuzzyGet", () => {
    it("gets a list of all key/value pairs that at least partially match a key", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false);

      assert.deepEqual([...trie.fuzzyGet("bar")], [["bar", 15], ["barstool", false]]);
    });

    it("gets a list of all key/value pairs that at least partially match a key #2", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false).add("b", "b");

      assert.deepEqual([...trie.fuzzyGet("b")], [["b", "b"], ["bar", 15], ["barstool", false]]);
    });

    it("searches regardless of case.", () => {
      const names = require("./names");
      const results = new Trie(names).fuzzyGet("sc");
      const resultsArr = [...results];

      assert.equal(resultsArr.length, 3);
      assert.equal(resultsArr[1][0], "Scott");
      assert.equal(resultsArr[2][0], "scott");
    });

    it("searches regardless of case #2.", () => {
      const names = require("./names");
      const results = new Trie(names).fuzzyGet("john");
      const resultsArr = [...results];

      assert.equal(resultsArr.length, 4);
      assert.equal(resultsArr[3][0], "Johnny");
    });

    it("should return no results for a key that does not exist.", () => {
      const names = require("./names");
      const results = new Trie(names).fuzzyGet("zelda");
      const resultsArr = [...results];

      assert.equal(resultsArr.length, 0);
    });
  });

  describe("Entries", () => {
    it("returns all the entries of a trie", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false).add("b", "b");

      assert.deepEqual([...trie.entries()], [["b", "b"], ["bar", 15], ["barstool", false]]);
    });
  });

  describe("Keys", () => {
    it("returns all the keys of a trie", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false).add("b", "b");

      assert.deepEqual([...trie.keys()], ["b", "bar", "barstool"]);
    });
  });

  describe("Values", () => {
    it("returns all the values of a trie", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false).add("b", "b");

      assert.deepEqual([...trie.values()], ["b", 15, false]);
    });
  });

  describe("forEach", () => {
    it("executes a callback once for each key/value pair.", () => {
      const trie = new Trie().add("bar", 15).add("barstool", false).add("b", "b");

      const values = ["b", 15, false];
      const keys = ["b", "bar", "barstool"];
      let returnedKeys = [];
      let returnedValues = [];
      let thisObj = {};
      const callback = function(key, value) {
        returnedValues.push(value);
        returnedKeys.push(key);
        this[key] = value;
      };

      trie.forEach(callback, thisObj);

      assert.equal(thisObj.bar, 15);
      assert.deepEqual(returnedValues, ["b", 15, false]);
      assert.deepEqual(returnedKeys, ["b", "bar", "barstool"]);
    });
  });

  describe("calculateHash", () => {
    it("should work properly (if branches don't have values)", () => {
      const trie = new Trie().add("bao", 10).add("barstool", 42);
      trie.calculateHash();
      assert.equal(trie.hash, "22d18a2b318c31b2fcc39cce93a13fff55964496243585f2aeebbe6cc39e45dd");
    })

    it("should work properly (if a branch has a value)", () => {
      const trie = new Trie().add("bar", 15).add("bao", 10).add("barstool", 42);
      trie.calculateHash();

      assert.equal(trie.hash, "c5d5a515a129b2d7dcc9451a62d8839c004b6be921b77e469f66a53ec9bd1bc1");
    })

    it("should don't get confused if called multiple times", () => {
      const trie = new Trie().add("bar", 15).add("bao", 10).add("barstool", 42);
      trie.calculateHash();
      trie.calculateHash();

      assert.equal(trie.hash, "c5d5a515a129b2d7dcc9451a62d8839c004b6be921b77e469f66a53ec9bd1bc1");
    })

    it("should not change the hash if a branche-node is deleted", () => {
      const trie = new Trie().add("bar", 15).add("bao", 10).add("barstool", 42);
      trie.calculateHash();
      trie.deleteBranch("bar");
      assert.equal(trie.hash, "c5d5a515a129b2d7dcc9451a62d8839c004b6be921b77e469f66a53ec9bd1bc1");


      trie.calculateHash()
      assert.equal(trie.hash, "c5d5a515a129b2d7dcc9451a62d8839c004b6be921b77e469f66a53ec9bd1bc1");
      assert.equal(trie.get("bao"), 10);
      assert.equal(trie.get("barstool"), null);
      assert.equal(trie.get("bar"), null);
      assert.equal(trie.getTrie("bar").store.size, 0);
      assert.equal(trie.getTrie("bar").value, null);
    })

    it("should also be shown in entriesWithHashs()", () => {
      const trie = new Trie().add("bar", 15).add("bao", 10).add("barstool", 42);
      trie.calculateHash();
      assert.equal(trie.hash, "c5d5a515a129b2d7dcc9451a62d8839c004b6be921b77e469f66a53ec9bd1bc1");

      let entryArray = [];
      for (const entry of trie.entriesWithHashs()) {
        entryArray.push(entry);
      }
      assert.deepEqual(entryArray[0], ['bar', 15, 'ad3a49ec656f4a2fda4b11110252327f57bcc45fe588f71ed535c168f7ef5234']);
      assert.deepEqual(entryArray[1], ['barstool', 42, '22e3303723319c7c91155563f6dcbc6b9808fbd072aabf522e90700220a41516']);
      assert.deepEqual(entryArray[2], ['bao', 10, '859365b2e0f586f0186b557afe8789974f4519dd752b0355873910b5691caa19']);
    })

    it("should also be shown in entriesWithHashs() even when branches where removed", () => {
      const trie = new Trie().add("bar", 15).add("bao", 10).add("barstool", 42);
      trie.calculateHash();
      assert.equal(trie.hash, "c5d5a515a129b2d7dcc9451a62d8839c004b6be921b77e469f66a53ec9bd1bc1");
      trie.deleteBranch("bar");

      let entryArray = [];
      for (const entry of trie.entriesWithHashs()) {
        entryArray.push(entry);
      }
      assert.deepEqual(entryArray[0], ['bar', null, 'ad3a49ec656f4a2fda4b11110252327f57bcc45fe588f71ed535c168f7ef5234']);
      assert.deepEqual(entryArray[1], ['bao', 10, '859365b2e0f586f0186b557afe8789974f4519dd752b0355873910b5691caa19']);
    })

  });

});

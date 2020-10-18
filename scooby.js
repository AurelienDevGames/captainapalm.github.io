const ghostSymbol = "👻";
const reactedSymbol = "✅";
const noreactionSymbol = "❌";

const scoobyApp = {
  data() {
    return {
      clues: {
        evidences: [],
        unaffected: [],
      },
      cluesNames: ["EMF Level 5", "Ghost Orb", "Spirit Box", "Freezing Temperatures", "Ghost Writing", "Fingerprints"],
      ghosts: [],
    };
  },
  computed: {
    ghostsByClues() {
        let suspects = this.ghosts;
        this.clues.evidences.forEach(e => {
            suspects = _.filter(suspects, function(g) { return _.some(g.clues, function(ev) { return ev === e})});
        });
        this.clues.unaffected.forEach(e => {
            suspects = _.filter(suspects, function(g) { return !_.some(g.clues, function(ev) { return ev === e})});
        })
        return suspects;
    },
    dealBreakers() {
        if (this.clues.evidences.length == 0 && this.clues.unaffected.length == 0) {
            return this.cluesNames;
        }

        let remainingClues = []

        // Collect every remaining possible clues
        _.each(this.ghostsByClues,function(e) {
            remainingClues = _.concat(remainingClues, e.clues)
        });
        remainingClues = _.uniq(remainingClues)

        // Exclude already collected clues
        remainingClues = _.difference(remainingClues, this.clues.evidences)
        remainingClues = _.difference(remainingClues, this.clues.unaffected)

        return remainingClues
    }
  },
  beforeMount() {
      this.invokeGhosts();
  },
  methods: {
      async invokeGhosts() {
          const res = await fetch("./ghosts.json")
          const data = await res.json();
          this.ghosts = data.ghosts;
      },
      modifyEvidence(data) {
          if (data.state == 0) {
            this.clues.unaffected.push(data.evidenceName);
            this.clues.evidences = _.reject(this.clues.evidences, function(e) { return e == data.evidenceName})
          }
          if (data.state == 1) {
            this.clues.unaffected = _.reject(this.clues.unaffected, function(e) { return e == data.evidenceName})
            this.clues.evidences = _.reject(this.clues.evidences, function(e) { return e == data.evidenceName})
          } 
          if (data.state == 2) {
            this.clues.evidences.push(data.evidenceName);
            this.clues.unaffected = _.reject(this.clues.unaffected, function(e) { return e == data.evidenceName})
          } 
      }
  }
};

const app = Vue.createApp(scoobyApp)

app.component("evidence", {
    props: ["evidence-name"],
    data() {
        return {
            index: Math.random().toString(36).substring(7)
        }
    },
    methods: {
        emitClue(evidenceName, state) {
            this.$emit('toggle-clue', {evidenceName: evidenceName, state: state})
        }
    },
    template: `
        <span>{{evidenceName}}</span>
        <div class="switch-toggle switch-3 switch-candy">
            <input v-bind:id="'off-'+index" v-bind:name="'state-d-'+index" type="radio" />
            <label v-bind:for="'off-'+index" @click="emitClue(evidenceName, 0)">❌</label>
        
            <input v-bind:id="'na-'+index"  v-bind:name="'state-d-'+index" type="radio" checked="checked" />
            <label v-bind:for="'na-'+index" @click="emitClue(evidenceName, 1)">👻</label>
        
            <input v-bind:id="'on-'+index"  v-bind:name="'state-d-'+index" type="radio" />
            <label v-bind:for="'on-'+index" @click="emitClue(evidenceName, 2)">✅</label>
        
            <a></a>
        </div>
    `
})

app.mount("#app");
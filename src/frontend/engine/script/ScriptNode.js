import { validateScriptDataTypes } from './ScriptDataType.js'
import { ScriptNodeData } from './ScriptNodeData.js'
import { Component } from '%component/Component.js'

export class ScriptNode extends Component {
  constructor(debugName, graph, inputTypes, outputTypes, fn) {
    super(debugName)
    this.graph = graph
    this.graph.addNode(this)
    this.data = new ScriptNodeData(inputTypes, outputTypes, fn)
    // cached outputs from last run
    this.outputs = []
    // whether or not this node should be evaluated during current graph execution
    this.active = false
  }
  checkIndex(types, index) {
    if (index < 0 || index > types.length) {
      this.logError(`Invalid index ${index}`)
      return false
    }
    return true
  }
  checkInputIndex(index) {
    return this.checkIndex(this.data.inputTypes, index)
  }
  checkOutputIndex(index) {
    return this.checkIndex(this.data.outputTypes, index)
  }
  // outputNode.outputs[outputIndex] => this.inputs[inputIndex]
  attachAsInput(outputNode, outputIndex, inputIndex) {
    if (!this.graph.isSameComponent(outputNode.graph)) {
      this.logError(`Cannot attach two ScriptNodes from different Graphs`)
      return
    }
    this.graph.addEdge(outputNode, outputIndex, this, inputIndex)
  }
  // this.outputs[outputIndex] => inputNode.inputs[inputIndex]
  attachAsOutput(outputIndex, inputNode, inputIndex) {
    if (!this.graph.isSameComponent(inputNode.graph)) {
      this.logError(`Cannot attach two ScriptNodes from different Graphs`)
      return
    }
    this.graph.addEdge(this, outputIndex, inputNode, inputIndex)
  }
  run(inputs) {
    if (!this.active) return

    if (!validateScriptDataTypes(inputs, this.data.inputTypes.types)) {
      this.logError('Invalid input')
      return
    }

    const results = this.data.fn(inputs)
    this.outputs = results.map((result) => result.value)
    // propagate activation
    let outboundEdges = this.graph.edges.get(this.id).out
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < outboundEdges.length; i++) {
      // get an outbound edge and the output associated with that edge
      const edge = outboundEdges[i]
      const result = results[edge.outputIndex]
      // if the associated output carries activation, activate the edge's other node
      if (result.activate) edge.inputNode.active = true
    }
  }
}

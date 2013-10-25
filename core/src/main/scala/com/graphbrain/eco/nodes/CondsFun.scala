package com.graphbrain.eco.nodes

import com.graphbrain.eco.NodeType.NodeType
import com.graphbrain.eco.{Context, Contexts, NodeType}

class CondsFun(params: Array[ProgNode], lastTokenPos: Int= -1) extends FunNode(params, lastTokenPos) {
  override val label = ";"

  override def ntype(ctxt: Context): NodeType = {
    for (p <- params) {
      if (p.ntype(ctxt) != NodeType.Boolean) {
        typeError()
        return NodeType.Unknown
      }
    }
    NodeType.Boolean
  }

  override def booleanValue(ctxts: Contexts, ctxt: Context): Boolean = {
    for (p <- params) {
      p match {
        case p: PatFun => p.booleanValue(ctxts, null)
        case p: ProgNode => {
          for (c <- ctxts.ctxts) {
            if (!p.booleanValue(ctxts, c)) {
              ctxts.remContext(c)
            }
          }
        }
      }

      ctxts.applyChanges()
    }

    true
  }

  override protected def typeError() = error("parameters must be boolean")
}
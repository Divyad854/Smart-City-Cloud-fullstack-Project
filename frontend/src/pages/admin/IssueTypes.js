import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";
import { toast } from "react-toastify";

export default function IssueTypes() {

  const [issueTypes, setIssueTypes] = useState([]);
  const [newType, setNewType] = useState("");

  const load = async () => {
    try {
      const r = await API.get("/issue-types");
      setIssueTypes(r.data.issueTypes || []);
    } catch (err) {
      console.error(err);
      setIssueTypes([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {

    if (!newType.trim()) {
      return toast.error("Enter issue type");
    }

    try {

      await API.post("/issue-types", { name: newType });

      toast.success("Issue type added");

      setNewType("");

      load();

    } catch {
      toast.error("Failed to add issue type");
    }
  };

  const remove = async (name) => {

    try {

      await API.delete(`/issue-types/${name}`);

      toast.success("Issue type removed");

      load();

    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <div className="top-bar">
          <h2>⚠️ Issue Types ({issueTypes.length})</h2>
        </div>

        <div className="page-content">

          <div className="card" style={{ marginBottom: 20 }}>

            <div style={{ display: "flex", gap: 10 }}>

              <input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Add new issue type..."
              />

              <button className="btn btn-primary" onClick={add}>
                Add
              </button>

            </div>

          </div>

          <div className="card">

            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>Issue Type</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {issueTypes.map((type, index) => (

                  <tr key={type}>

                    <td>{index + 1}</td>

                    <td>{type.replace(/_/g, " ")}</td>

                    <td>

                      <button
                        className="btn btn-danger"
                        onClick={() => remove(type)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}
import { createBusinessSearch } from "@/service/reposting.service";
import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "@/App";

const SearchJobModal = ({ isOpen, setIsOpen, handleJobSelect, workFlowID }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobNumbers, setJobNumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useContext(MainContext);
  const popref = useRef(null);

  const handleSelectJob = (jobNumber) => {
    setSelectedJob(jobNumber);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      const timeOut = setTimeout(() => {
        setLoading(true);
        createBusinessSearch(token, {
          workFlowID: workFlowID,
          search: searchTerm,
        })
          .then((res) => {
            const data = res.data;
            setJobNumbers(data);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 500);

      return () => clearTimeout(timeOut);
    }
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-40 py-2 absolute bg-white border border-[#dedede] rounded-lg shadow-sm cursor-default" ref={popref}>
      <div className="flex justify-between items-center gap-2 mb-3 px-3">
        <input
          type="text"
          placeholder="Search Job Number"
          className="w-2/4 grow py-1 border-none rounded text-xs placeholder:text-[85%] placeholder:text-black outline-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="bg-gray-200 rounded-md size-4 flex items-center justify-center" onClick={closeModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ul className="list-none max-h-40 overflow-y-auto px-3">
        {loading ? (
          <li className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-green-500"></div>
          </li>
        ) : jobNumbers.length > 0 ? (
          jobNumbers.map((job, index) => (
            <li key={job?.["Job No"]} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
              <h5 className="text-xs text-gray-500">{job?.["Job No"]}</h5>
              <div className="relative">
                <input
                  id={`radio-${index}`}
                  type="radio"
                  value={job}
                  name="job-radio"
                  checked={selectedJob === job}
                  onChange={() => handleSelectJob(job)}
                  className="hidden"
                />
                <label
                  htmlFor={`radio-${index}`}
                  className={`cursor-pointer w-5 h-5 block rounded-full border border-solid ${
                    selectedJob === job ? "border-transparent" : "border-green-500"
                  } relative`}
                >
                  {selectedJob === job && (
                    <svg width="20" height="20" viewBox="0 0 20 20" className="absolute top-0 left-0" xmlns="http://www.w3.org/2000/svg">
                      <rect width="19.69" height="19.69" rx="9.85" fill="#2BD282" />
                      <path d="M13.0084 7L8.89225 10.8185L7.15151 8.96089L6 10.0399L8.81225 13.0411L14.0785 8.16002L13.0084 7Z" fill="white" />
                    </svg>
                  )}
                </label>
              </div>
            </li>
          ))
        ) : (
          <li className="text-xs text-gray-400">No jobs found</li>
        )}
      </ul>
    </div>
  );
};

export default SearchJobModal;
